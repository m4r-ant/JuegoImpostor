import { type NextRequest, NextResponse } from "next/server"
import { generateRoomCode } from "@/lib/game-logic"

// Almacenamiento temporal (en producción usar BD)
const rooms = new Map()

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || username.length > 20) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 })
    }

    const roomId = crypto.randomUUID()
    const code = generateRoomCode()

    const room = {
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

    rooms.set(roomId, room)
    rooms.set(code, room)

    return NextResponse.json({ roomId, code })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  // Get active rooms (for testing)
  const activeRooms = Array.from(rooms.values()).filter((room: any) => room.status === "waiting")

  return NextResponse.json({ rooms: activeRooms })
}
