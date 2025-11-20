// Types and interfaces for the game
export type PlayerRole = "impostor" | "innocent"
export type GameStatus = "waiting" | "sector" | "revealing" | "round" | "voting" | "voting-result" | "finished"
export type GameResult = "impostors_caught" | "impostors_escaped" | "tie"

export interface Player {
  id: string
  username: string
  role?: PlayerRole
  isAlive: boolean
  points: number
  socketId?: string
}

export interface Room {
  id: string
  code: string
  hostId: string
  status: GameStatus
  players: Player[]
  currentPlayers: number
  maxPlayers: number
  createdAt: Date
  updatedAt: Date
  currentGame?: Game
}

export interface Artwork {
  id: string
  sector: number // 1, 2, 3
  title?: string
  imageUrl: string
  artist?: string
  year?: number
  characteristics: string[]
}

export interface Game {
  id: string
  roomId: string
  artwork: Artwork
  impostorIds: string[]
  status: GameStatus
  round: number
  // Use plain objects for easy serialization in memory/store
  descriptions: Record<string, string>
  votes: Record<string, string> // playerId -> votedForId
  votedOutId?: string
  result?: GameResult
  readyPlayers?: string[] // Players who clicked "Listo"
  // Speaking order for this round (randomized, impostors at end)
  speakingOrder?: string[]
  currentSpeakerIndex?: number
  createdAt: Date
}

export interface WebSocketMessage {
  type: string
  roomId: string
  playerId?: string
  payload: any
}
