import { NextResponse } from "next/server"
import { getRoom, saveRoom } from "@/lib/rooms-store"
import { emitToSocket } from "@/lib/server-socket-client"

export async function POST(_request: Request, { params }: { params: { code: string } }) {
  const code = (await params).code
  const room = getRoom(code)

  if (!room || !room.currentGame) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  let newStatus: "revealing" | "round" | "voting" | "finished" = "revealing"

  // Determine next phase based on current status
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
    default:
      newStatus = "revealing"
  }

  room.status = newStatus
  room.updatedAt = new Date()

  saveRoom(room)

  try {
    emitToSocket("phase-changed", { roomId: room.id, newStatus })
  } catch (err) {
    console.error("Failed to emit phase-changed", err)
  }

  return NextResponse.json({ status: newStatus })
}
