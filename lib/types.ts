// Types and interfaces for the game
export type PlayerRole = "impostor" | "innocent"
export type GameStatus = "waiting" | "playing" | "revealing" | "round" | "voting" | "finished"
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
  descriptions: Map<string, string>
  votes: Map<string, string> // playerId -> votedForId
  votedOutId?: string
  result?: GameResult
  createdAt: Date
}

export interface WebSocketMessage {
  type: string
  roomId: string
  playerId?: string
  payload: any
}
