import { NextResponse } from "next/server"
import { getRoom, saveRoom } from "@/lib/rooms-store"
import { assignRoles, getRandomSector } from "@/lib/game-logic"
import type { Game, Artwork } from "@/lib/types"
import { emitToSocket } from "@/lib/server-socket-client"

export async function POST(_request: Request, { params }: { params: { code: string } }) {
  const code = (await params).code
  const room = getRoom(code)

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  if (room.status !== "waiting") {
    return NextResponse.json({ error: "Game already started" }, { status: 409 })
  }

  // Assign roles to players
  const updatedPlayers = assignRoles(room.players)
  room.players = updatedPlayers

  // Choose sector and artwork (use placeholder from public/ if available)
  const sector = getRandomSector()

  const artwork: Artwork = {
    id: crypto.randomUUID(),
    sector,
    title: "Sin Título",
    imageUrl: "/contemporary-art-sculpture.jpg",
    artist: "Desconocido",
    year: new Date().getFullYear(),
    characteristics: ["abstracto", "colores oscuros"],
  }

  const impostorIds = updatedPlayers.filter((p) => p.role === "impostor").map((p) => p.id)

  const game: Game = {
    id: crypto.randomUUID(),
    roomId: room.id,
    artwork,
    impostorIds,
    status: "sector",
    round: 0,
    descriptions: {},
    votes: {},
    createdAt: new Date(),
  }

  room.currentGame = game
  room.status = "sector"
  room.updatedAt = new Date()

  saveRoom(room)

  try {
    emitToSocket("game-started", { roomId: room.id, game })
  } catch (err) {
    console.error("Failed to emit game-started", err)
  }

  return NextResponse.json({ status: room.status, gameId: game.id })
}
