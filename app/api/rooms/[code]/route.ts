import { type NextRequest, NextResponse } from "next/server"
import { getRoom } from "@/lib/rooms-store"

export async function GET(_request: NextRequest, { params }: { params: { code: string } }) {
  const code = (await params).code.toUpperCase()
  const room = getRoom(code)

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  return NextResponse.json(room)
}
