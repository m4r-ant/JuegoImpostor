import { NextResponse } from "next/server"
import { getRoom, saveRoom } from "@/lib/rooms-store"
import { emitToSocket } from "@/lib/server-socket-client"
import { determineWinner } from "@/lib/game-logic"

export async function POST(request: Request, { params }: { params: { code: string } }) {
  try {
    const code = (await params).code
    const { playerId, votedForId } = await request.json()

    if (!playerId || !votedForId) {
      return NextResponse.json({ error: "playerId and votedForId are required" }, { status: 400 })
    }

    const room = getRoom(code)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (!room.currentGame) {
      return NextResponse.json({ error: "Game not started" }, { status: 409 })
    }

    // Record the vote
    room.currentGame.votes[playerId] = votedForId
    room.updatedAt = new Date()
    saveRoom(room)

    // Check if all players have voted
    const totalVotes = Object.keys(room.currentGame.votes).length
    const allVoted = totalVotes === room.players.length

    if (allVoted) {
      // Calculate who got the most votes
      const voteCounts: Record<string, number> = {}
      Object.values(room.currentGame.votes).forEach((votedId) => {
        voteCounts[votedId] = (voteCounts[votedId] || 0) + 1
      })

      const votedOutId = Object.entries(voteCounts).sort(([, a], [, b]) => b - a)[0]?.[0]

      if (votedOutId) {
        room.currentGame.votedOutId = votedOutId

        // Mark player as not alive
        const votedPlayer = room.players.find((p) => p.id === votedOutId)
        if (votedPlayer) {
          votedPlayer.isAlive = false
        }

        // Remove from impostors list if they were an impostor
        if (room.currentGame.impostorIds.includes(votedOutId)) {
          room.currentGame.impostorIds = room.currentGame.impostorIds.filter((id) => id !== votedOutId)
        }

        // Get alive players only
        const alivePlayers = room.players.filter((p) => p.isAlive)

        // Check win conditions
        const result = determineWinner(room.currentGame.impostorIds, alivePlayers, votedOutId)

        // Always show voting result screen
        room.status = "voting-result"
        room.currentGame.status = "voting-result"

        if (result.winner === "impostors") {
          // Game finished - impostors win
          room.currentGame.result = "impostors_escaped"
        } else if (result.winner === "innocents") {
          // Game finished - innocents win
          room.currentGame.result = "impostors_caught"
        } else {
          // Continue to next round (same room, same sector)
          room.currentGame.round += 1
          room.currentGame.votes = {} // Reset votes
          room.currentGame.readyPlayers = [] // Reset ready players
        }
      }

      saveRoom(room)

      try {
        emitToSocket("voting-complete", {
          roomId: room.id,
          votedOutId,
          votes: voteCounts,
        })

        if (room.status === "finished") {
          emitToSocket("phase-changed", {
            roomId: room.id,
            phase: "finished",
          })
        } else if (room.status === "sector") {
          emitToSocket("phase-changed", {
            roomId: room.id,
            phase: "sector",
          })
        }
      } catch (err) {
        console.error("Failed to emit events", err)
      }
    }

    return NextResponse.json({ allVoted, totalVotes })
  } catch (error) {
    console.error("Error recording vote:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
