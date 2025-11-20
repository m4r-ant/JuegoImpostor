import type { Room } from "./types"

// Singleton pattern: ensure rooms persists across module reloads
type RoomsStore = {
  rooms: Map<string, Room>
}

declare global {
  var roomsStore: RoomsStore | undefined
}

function getRoomsStore(): RoomsStore {
  if (!globalThis.roomsStore) {
    globalThis.roomsStore = {
      rooms: new Map<string, Room>(),
    }
    console.log("[rooms-store] Initialized global rooms store")
  }
  return globalThis.roomsStore
}

export function saveRoom(room: Room) {
  const store = getRoomsStore()
  store.rooms.set(room.id, room)
  store.rooms.set(room.code, room)
  console.log(`[rooms-store] Saved room: id=${room.id}, code=${room.code}, total=${store.rooms.size}`)
}

export function getRoom(key: string): Room | undefined {
  const store = getRoomsStore()
  
  // Try exact match first (for roomId or code as-is)
  const direct = store.rooms.get(key)
  if (direct) {
    console.log(`[rooms-store] Found room by exact key: ${key}`)
    return direct
  }
  
  // Try uppercase (for room codes which are uppercase)
  const upper = store.rooms.get(key.toUpperCase())
  if (upper) {
    console.log(`[rooms-store] Found room by uppercase key: ${key.toUpperCase()}`)
    return upper
  }
  
  console.log(`[rooms-store] Room NOT found for key: ${key}. Available keys:`, Array.from(store.rooms.keys()))
  return undefined
}

export function listRooms(): Room[] {
  const store = getRoomsStore()
  return Array.from(new Set(store.rooms.values()))
}
