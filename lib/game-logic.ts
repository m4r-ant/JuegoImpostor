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
  votedOutId: string | undefined,
): { winner: "innocents" | "impostors" | "tie"; message: string } {
  if (!votedOutId) {
    return {
      winner: "impostors",
      message: "No se votó a nadie. Los impostores escapan.",
    }
  }

  if (impostorIds.includes(votedOutId)) {
    const remaining = impostorIds.filter((id) => id !== votedOutId).length
    if (remaining === 0) {
      return {
        winner: "innocents",
        message: "¡Los inocentes ganaron! Eliminaron a todos los impostores.",
      }
    }
    return {
      winner: "innocents",
      message: `¡Los inocentes ganaron! Un impostor eliminado (${remaining} restante).`,
    }
  }

  return {
    winner: "impostors",
    message: "Los inocentes votaron mal. Los impostores ganan.",
  }
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
