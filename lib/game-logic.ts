// Game logic functions
import type { Player } from "./types"

export function calculateImpostorCount(playerCount: number): number {
  if (playerCount < 3) return 0
  if (playerCount <= 5) return 1
  if (playerCount <= 8) return 2
  if (playerCount <= 11) return 3
  return Math.floor(playerCount / 3)
}

export function assignRoles(players: Player[]): Player[] {
  const impostorCount = calculateImpostorCount(players.length)
  const shuffled = [...players].sort(() => Math.random() - 0.5)

  return shuffled.map((player, index) => ({
    ...player,
    role: index < impostorCount ? "impostor" : "innocent",
  }))
}

export function getRandomSector(): number {
  return Math.floor(Math.random() * 3) + 1
}

export function determineWinner(
  impostorIds: string[],
  alivePlayers: Player[],
  votedOutId?: string,
): { winner: "innocents" | "impostors" | "tie"; message: string } {
  // Count alive impostors and innocents
  const aliveImpostors = alivePlayers.filter((p) => impostorIds.includes(p.id))
  const aliveInnocents = alivePlayers.filter((p) => !impostorIds.includes(p.id))

  // If impostors == innocents, impostors win
  if (aliveImpostors.length >= aliveInnocents.length && aliveInnocents.length > 0) {
    return {
      winner: "impostors",
      message: `Los impostores ganan. ${aliveImpostors.length} impostores vs ${aliveInnocents.length} inocentes.`,
    }
  }

  // If all impostors are eliminated, innocents win
  if (aliveImpostors.length === 0) {
    return {
      winner: "innocents",
      message: "¡Los inocentes ganaron! Eliminaron a todos los impostores.",
    }
  }

  // If there are no innocents, impostors win
  if (aliveInnocents.length === 0) {
    return {
      winner: "impostors",
      message: "Los impostores ganan. Eliminaron a todos los inocentes.",
    }
  }

  // Game continues
  return {
    winner: "tie",
    message: "El juego continúa.",
  }
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function generateSpeakingOrder(players: Player[], impostorIds: string[]): string[] {
  // Separate innocents and impostors
  const innocents = players
    .filter((p) => !impostorIds.includes(p.id))
    .map((p) => p.id)
  const impostors = players
    .filter((p) => impostorIds.includes(p.id))
    .map((p) => p.id)

  // Shuffle innocents
  const shuffledInnocents = [...innocents].sort(() => Math.random() - 0.5)
  
  // Impostors go last
  return [...shuffledInnocents, ...impostors]
}
