import { notFound } from "next/navigation"
import { ArtworkReveal } from "./reveal"
import { DescriptionRound } from "./round"
import { GameResults } from "./results"
import { Lobby } from "./lobby"
import { VotingPanel } from "./voting"
import { VotingResult } from "./voting-result"
import { SectorAnnouncement } from "./sector"
import { SpeakingRound } from "./speaking"
import { getRoom } from "@/lib/rooms-store"

interface PageProps {
  params: Promise<{ roomId: string }>
}

export default async function GamePage({ params }: PageProps) {
  const { roomId } = await params
  const room = getRoom(roomId)

  if (!room) {
    notFound()
  }

  switch (room.status) {
    case "waiting":
      return <Lobby room={room} />
    case "sector":
      return <SectorAnnouncement room={room} />
    case "revealing":
      return <ArtworkReveal room={room} />
    case "round":
      return <SpeakingRound room={room} />
    case "voting":
      return <VotingPanel room={room} />
    case "voting-result":
      return <VotingResult room={room} />
    case "finished":
      return <GameResults room={room} />
    default:
      return <Lobby room={room} />
  }
}
