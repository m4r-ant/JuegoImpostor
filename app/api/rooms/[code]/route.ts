import { type NextRequest, NextResponse } from "next/server"

// Temp storage
const rooms = new Map()

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const code = (await params).code.toUpperCase()
  const room = rooms.get(code)

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  return NextResponse.json(room)
}
