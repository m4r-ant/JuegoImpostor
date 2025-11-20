import { notFound } from "next/navigation"
import { ArtworkReveal } from "./reveal"
import { DescriptionRound } from "./round"
import { GameResults } from "./results"
import { Lobby } from "./lobby"
import { VotingPanel } from "./voting"
import { getRoom } from "@/lib/rooms-store"

interface PageProps {
  params: { roomId: string }
}

export default function GamePage({ params }: PageProps) {
  const { roomId } = params
  const room = getRoom(roomId)

  if (!room) {
    notFound()
  }

  switch (room.status) {
    case "waiting":
      return <Lobby room={room} />
    case "revealing":
      return <ArtworkReveal room={room} />
    case "round":
      return <DescriptionRound room={room} />
    case "voting":
      return <VotingPanel room={room} />
    case "finished":
      return <GameResults room={room} />
    default:
      return <Lobby room={room} />
  }
}
