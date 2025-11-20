import { type NextRequest, NextResponse } from "next/server"
import { generateRoomCode } from "@/lib/game-logic"
import { listRooms, saveRoom } from "@/lib/rooms-store"
import type { Room } from "@/lib/types"
import { emitToSocket } from "@/lib/server-socket-client"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || username.length > 20) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 })
    }

    const roomId = crypto.randomUUID()
    const code = generateRoomCode()

    const playerId = crypto.randomUUID()

    const room: Room = {
      id: roomId,
      code,
      hostId: playerId,
      status: "waiting",
      players: [
        {
          id: playerId,
          username,
          isAlive: true,
          points: 0,
        },
      ],
      currentPlayers: 1,
      maxPlayers: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    saveRoom(room)

    // emit player-joined to socket server for realtime updates
    try {
      emitToSocket("player-joined", { roomId: room.id, player: { id: playerId, username } })
    } catch (err) {
      console.error("Failed to emit player-joined", err)
    }

    return NextResponse.json({ roomId, code, playerId })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  // Get active rooms (for testing)
  const activeRooms = listRooms().filter((room) => room.status === "waiting")

  return NextResponse.json({ rooms: activeRooms })
}
