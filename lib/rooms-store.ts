import type { Room } from "./types"

const rooms = new Map<string, Room>()

export function saveRoom(room: Room) {
  rooms.set(room.id, room)
  rooms.set(room.code, room)
}

export function getRoom(key: string): Room | undefined {
  return rooms.get(key) ?? rooms.get(key.toUpperCase())
}

export function listRooms(): Room[] {
  return Array.from(new Set(rooms.values()))
}
