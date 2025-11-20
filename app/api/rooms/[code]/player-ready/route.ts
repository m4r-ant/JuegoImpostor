import { NextResponse } from "next/server"
import { getRoom, saveRoom } from "@/lib/rooms-store"
import { generateSpeakingOrder } from "@/lib/game-logic"
import { emitToSocket } from "@/lib/server-socket-client"

export async function POST(request: Request, { params }: { params: { code: string } }) {
  try {
    const code = (await params).code
    const { playerId } = await request.json()

    if (!playerId) {
      return NextResponse.json({ error: "playerId is required" }, { status: 400 })
    }

    const room = getRoom(code)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (!room.currentGame) {
      return NextResponse.json({ error: "Game not started" }, { status: 409 })
    }

    // Add player to readyPlayers
    if (!room.currentGame.readyPlayers) {
      room.currentGame.readyPlayers = []
    }

    if (!room.currentGame.readyPlayers.includes(playerId)) {
      room.currentGame.readyPlayers.push(playerId)
    }

    // Check if all players are ready
    const allReady = room.currentGame.readyPlayers.length === room.players.length

    if (allReady) {
      // Generate speaking order for this round
      room.currentGame.speakingOrder = generateSpeakingOrder(room.players, room.currentGame.impostorIds)
      room.currentGame.currentSpeakerIndex = 0
      room.status = "round"
      room.currentGame.status = "round"
      room.currentGame.readyPlayers = [] // Reset for next phase
    }

    room.updatedAt = new Date()
    saveRoom(room)

    try {
      emitToSocket("player-ready", { roomId: room.id, playerId })
      if (allReady) {
        emitToSocket("phase-changed", {
          roomId: room.id,
          phase: "round",
          speakingOrder: room.currentGame.speakingOrder,
          firstSpeaker: room.currentGame.speakingOrder?.[0],
        })
      }
    } catch (err) {
      console.error("Failed to emit events", err)
    }

    return NextResponse.json({ ready: allReady, readyCount: room.currentGame.readyPlayers.length })
  } catch (error) {
    console.error("Error marking player ready:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
