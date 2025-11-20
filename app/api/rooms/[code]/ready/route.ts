import { NextRequest, NextResponse } from "next/server"
import { getRoom, saveRoom } from "@/lib/rooms-store"
import { emitToSocket } from "@/lib/server-socket-client"

export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = (await params).code
    const { playerId } = await request.json()

    const room = getRoom(code)

    if (!room || !room.currentGame) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Initialize readyPlayers if doesn't exist
    if (!room.currentGame.readyPlayers) {
      room.currentGame.readyPlayers = []
    }

    // Add playerId if not already there
    if (!room.currentGame.readyPlayers.includes(playerId)) {
      room.currentGame.readyPlayers.push(playerId)
    }

    const readyCount = room.currentGame.readyPlayers.length
    const totalPlayers = room.players.length

    saveRoom(room)

    // Emit the ready count to all clients
    try {
      emitToSocket("player-ready", { roomId: room.id, readyCount, totalPlayers })
    } catch (err) {
      console.error("Failed to emit player-ready", err)
    }

    // If all players are ready, auto-advance to next phase
    if (readyCount === totalPlayers) {
      console.log(`[Ready] All ${totalPlayers} players ready, advancing phase`)
      
      let newStatus: "revealing" | "round" | "voting" | "finished" = "revealing"

      switch (room.status) {
        case "sector":
          newStatus = "revealing"
          break
        case "revealing":
          newStatus = "round"
          break
        case "round":
          newStatus = "voting"
          break
        case "voting":
          newStatus = "finished"
          break
      }

      room.status = newStatus
      room.currentGame.readyPlayers = [] // Reset for next phase
      room.updatedAt = new Date()

      saveRoom(room)

      try {
        emitToSocket("phase-changed", { roomId: room.id, newStatus })
      } catch (err) {
        console.error("Failed to emit phase-changed", err)
      }
    }

    return NextResponse.json({ readyCount, totalPlayers })
  } catch (error) {
    console.error("Error in player-ready endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
