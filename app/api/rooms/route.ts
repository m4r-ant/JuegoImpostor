import { type NextRequest, NextResponse } from "next/server"
import { generateRoomCode } from "@/lib/game-logic"
import { listRooms, saveRoom } from "@/lib/rooms-store"
import type { Room } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || username.length > 20) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 })
    }

    const roomId = crypto.randomUUID()
    const code = generateRoomCode()

    const room: Room = {
      id: roomId,
      code,
      hostId: crypto.randomUUID(),
      status: "waiting",
      players: [
        {
          id: crypto.randomUUID(),
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

    return NextResponse.json({ roomId, code })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  // Get active rooms (for testing)
  const activeRooms = listRooms().filter((room) => room.status === "waiting")

  return NextResponse.json({ rooms: activeRooms })
}
