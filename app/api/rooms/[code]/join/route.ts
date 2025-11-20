import { type NextRequest, NextResponse } from "next/server"

const rooms = new Map()

export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = (await params).code.toUpperCase()
    const { username } = await request.json()

    const room = rooms.get(code)

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

    room.players.push({
      id: crypto.randomUUID(),
      username,
      isAlive: true,
      points: 0,
    })

    room.currentPlayers += 1
    room.updatedAt = new Date()

    return NextResponse.json({ roomId: room.id })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
