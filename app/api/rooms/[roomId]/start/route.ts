import { NextResponse } from "next/server"
import { getRoom, saveRoom } from "@/lib/rooms-store"

export async function POST(_request: Request, { params }: { params: { roomId: string } }) {
  const roomId = (await params).roomId
  const room = getRoom(roomId)

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  if (room.status !== "waiting") {
    return NextResponse.json({ error: "Game already started" }, { status: 409 })
  }

  room.status = "revealing"
  room.updatedAt = new Date()
  saveRoom(room)

  return NextResponse.json({ status: room.status })
}
