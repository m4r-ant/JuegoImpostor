import { NextResponse } from "next/server"
import { getRoom, saveRoom } from "@/lib/rooms-store"
import { emitToSocket } from "@/lib/server-socket-client"

export async function POST(request: Request, { params }: { params: { code: string } }) {
  try {
    const code = (await params).code
    const { nextPhase } = await request.json()

    if (!nextPhase) {
      return NextResponse.json({ error: "nextPhase is required" }, { status: 400 })
    }

    const room = getRoom(code)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (!room.currentGame) {
      return NextResponse.json({ error: "Game not started" }, { status: 409 })
    }

    // Update room status
    room.status = nextPhase
    room.currentGame.status = nextPhase
    room.updatedAt = new Date()

    saveRoom(room)

    try {
      emitToSocket("phase-changed", { roomId: room.id, phase: nextPhase })
    } catch (err) {
      console.error("Failed to emit phase-changed", err)
    }

    return NextResponse.json({ status: room.status })
  } catch (error) {
    console.error("Error changing phase:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
