import { type NextRequest, NextResponse } from "next/server"
import { getRoom, saveRoom } from "@/lib/rooms-store"
import { emitToSocket } from "@/lib/server-socket-client"

export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = (await params).code.toUpperCase()
    const { username } = await request.json()

    if (!username || username.length > 20) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 })
    }

    const room = getRoom(code)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.currentPlayers >= room.maxPlayers) {
      return NextResponse.json({ error: "Room is full" }, { status: 409 })
    }

    const playerExists = room.players.some((p: any) => p.username === username)

    if (playerExists) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    const playerId = crypto.randomUUID()

    room.players.push({
      id: playerId,
      username,
      isAlive: true,
      points: 0,
    })

    room.currentPlayers += 1
    room.updatedAt = new Date()

    saveRoom(room)

    try {
      emitToSocket("player-joined", { roomId: room.id, player: { id: playerId, username } })
    } catch (err) {
      console.error("Failed to emit player-joined", err)
    }

    return NextResponse.json({ roomId: room.id, playerId })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
