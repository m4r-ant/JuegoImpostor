# 🎨 MAC Impostor Game - Juego Multijugador en Tiempo Real

Un juego tipo "Impostor" basado en el Museo de Arte Contemporáneo (MAC), donde los jugadores deben identificar quién es el impostor basándose en características de obras de arte real del museo.

## 🎮 Cómo Funciona el Juego

### Flujo General
1. **Página de Entrada**: Crea una nueva sala o únete a una existente
2. **Selección de Jugadores**: Espera a que se unan al menos 3 jugadores (máximo infinito)
3. **Asignación de Roles**: Se asignan impostores automáticamente (1 por cada 3 jugadores)
4. **Selección de Sector**: Se elige aleatoriamente un sector del MAC (1, 2, 3)
5. **Revelación de Obra**: Los inocentes ven la obra por 5 segundos, impostores no
6. **Rondas de Descripción**: Cada jugador describe una característica de la obra
7. **Votación**: Los jugadores votan para eliminar a quien creen que es el impostor
8. **Resultado**: Se revela quién era el impostor y se contabilizan puntos

### Regla de Impostores
- **3 jugadores** = 1 impostor
- **4-5 jugadores** = 1 impostor
- **6 jugadores** = 2 impostores
- **7-8 jugadores** = 2 impostores
- **9+ jugadores** = 3 impostores

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** (App Router)
- **React 19** (Client Components para tiempo real)
- **TypeScript**
- **Tailwind CSS v4**
- **SWR** (Fetching en cliente)

### Backend
- **Next.js API Routes** (Route Handlers)
- **WebSocket** (Socket.io / Vercel Realtime recomendado)
- **Node.js**

### Base de Datos
- **PostgreSQL** (Neon) - Recomendado
- **Tablas principales**: 
  - `rooms` (salas de juego)
  - `players` (jugadores)
  - `games` (historial de juegos)
  - `artworks` (obras de arte del MAC)

### Real-time
- **Socket.io** O **Vercel AI SDK Realtime** (alternativa)
- WebSocket para sincronización en tiempo real

## 📁 Estructura del Proyecto

\`\`\`
mac-impostor-game/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx (Página de entrada)
│   ├── api/
│   │   ├── rooms/
│   │   │   ├── route.ts (GET: listar, POST: crear)
│   │   │   └── [id]/
│   │   │       ├── route.ts (GET: obtener sala)
│   │   │       ├── join.ts (POST: unirse)
│   │   │       └── start.ts (POST: iniciar juego)
│   │   ├── games/
│   │   │   ├── route.ts (GET: historial)
│   │   │   └── [gameId]/
│   │   │       ├── reveal.ts (POST: revelar obra)
│   │   │       ├── describe.ts (POST: enviar descripción)
│   │   │       └── vote.ts (POST: votar)
│   │   └── ws.ts (WebSocket handler)
│   └── game/
│       ├── [roomId]/
│       │   ├── page.tsx (Pantalla principal del juego)
│       │   ├── lobby.tsx (Espera de jugadores)
│       │   ├── reveal.tsx (Revelación de obra)
│       │   ├── round.tsx (Ronda de descripción)
│       │   └── voting.tsx (Votación)
├── components/
│   ├── entrance/
│   │   ├── create-room.tsx
│   │   └── join-room.tsx
│   ├── game/
│   │   ├── player-list.tsx
│   │   ├── artwork-reveal.tsx
│   │   ├── description-round.tsx
│   │   ├── voting-panel.tsx
│   │   └── game-results.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── ... (shadcn components)
├── hooks/
│   ├── use-game.ts (Estado del juego)
│   ├── use-websocket.ts (Conexión WebSocket)
│   └── use-players.ts (Gestión de jugadores)
├── lib/
│   ├── game-logic.ts (Lógica de impostores, votación)
│   ├── socket.ts (Configuración de Socket.io)
│   ├── db.ts (Conexión a BD)
│   └── types.ts (TypeScript types)
├── public/
│   └── artworks/ (Imágenes de obras del MAC)
├── scripts/
│   ├── init-db.sql (Script inicial BD)
│   └── seed-artworks.sql (Poblar obras de arte)
├── middleware.ts (Autenticación/autorización)
├── next.config.mjs
├── package.json
├── tsconfig.json
└── .env.example

\`\`\`

## 🗄️ Estructura de Base de Datos

### Tabla: rooms
\`\`\`sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  code VARCHAR(6) UNIQUE, -- Código único para unirse
  host_id UUID NOT NULL,
  status VARCHAR(20), -- 'waiting', 'playing', 'finished'
  max_players INT DEFAULT 20,
  current_players INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Tabla: players
\`\`\`sql
CREATE TABLE players (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id),
  username VARCHAR(50) NOT NULL,
  role VARCHAR(20), -- 'innocent' o 'impostor'
  is_alive BOOLEAN DEFAULT TRUE,
  points INT DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, username)
);
\`\`\`

### Tabla: artworks
\`\`\`sql
CREATE TABLE artworks (
  id UUID PRIMARY KEY,
  sector INT NOT NULL, -- 1, 2, 3
  title VARCHAR(255),
  image_url TEXT NOT NULL,
  artist VARCHAR(100),
  year INT,
  characteristics TEXT[], -- Array de características
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Tabla: games
\`\`\`sql
CREATE TABLE games (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id),
  artwork_id UUID NOT NULL REFERENCES artworks(id),
  impostor_id UUID REFERENCES players(id),
  voted_out_id UUID REFERENCES players(id),
  result VARCHAR(20), -- 'impostors_caught', 'impostors_escaped', 'tie'
  winner_team VARCHAR(20), -- 'innocents' o 'impostors'
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## 🚀 Configuración Multijugador

### Opción 1: Socket.io (Recomendado para desarrollo)
\`\`\`typescript
// lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');

// Eventos
socket.on('player-joined', (data) => {});
socket.on('game-started', (data) => {});
socket.on('artwork-revealed', (data) => {});
socket.on('round-ended', (data) => {});
socket.on('voting-started', (data) => {});
socket.on('game-ended', (data) => {});
\`\`\`

### Opción 2: Vercel Realtime (Para producción)
\`\`\`typescript
// lib/realtime.ts
import { Realtime } from '@vercel/realtime';

const realtime = new Realtime();
const channel = realtime.subscribe(`room-${roomId}`);

channel.on('message', (data) => {});
\`\`\`

### Flujo de Eventos en Tiempo Real

\`\`\`
1. Usuario crea/se une a sala
   ↓
2. Socket: 'player-joined' → Actualiza lista de jugadores
   ↓
3. Host inicia juego
   ↓
4. Socket: 'game-started' → Asigna roles (si es impostor no ve obra)
   ↓
5. Socket: 'artwork-revealed' → Muestra obra por 5 segundos
   ↓
6. Socket: 'round-started' → Cada jugador describe
   ↓
7. Player envía descripción → Socket: 'description-submitted'
   ↓
8. Socket: 'voting-started' → Panel de votación
   ↓
9. Players votan → Socket: 'vote-submitted'
   ↓
10. Socket: 'game-ended' → Revela resultado
\`\`\`

## 📝 Instalación y Desarrollo

### Prerequisites
- Node.js 18+
- PostgreSQL (Neon recomendado)
- npm o yarn

### Pasos

1. **Clonar el repositorio**
\`\`\`bash
git clone <repo>
cd mac-impostor-game
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
# o
yarn install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Necesitas:
\`\`\`
# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/mac_impostor

# Socket.io (si usas Socket.io)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Sesión (opcional, para autenticación)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
\`\`\`

4. **Inicializar base de datos**
\`\`\`bash
# Correr script SQL en tu BD
psql -U user -d mac_impostor -f scripts/init-db.sql
psql -U user -d mac_impostor -f scripts/seed-artworks.sql
\`\`\`

5. **Correr en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000)

6. **Build para producción**
\`\`\`bash
npm run build
npm start
\`\`\`

## 🎯 Características Implementadas

- [x] Creación de salas multijugador
- [x] Sistema de rol (Impostor/Inocente)
- [x] Asignación automática de impostores
- [x] Visualización de 5 segundos de la obra
- [x] Rondas de descripción en tiempo real
- [x] Sistema de votación
- [x] Chat/descripciones en vivo
- [x] Historial de juegos
- [x] Sistema de puntos

## 🔮 Características Futuras

- [ ] Autenticación con cuentas
- [ ] Sistema de ranking global
- [ ] Imágenes de obras del MAC reales
- [ ] Modo de equipos
- [ ] Sistema de badges/logros
- [ ] Replays de partidas
- [ ] Modo custom (subir obras)

## 🐛 Troubleshooting

### "No puedo conectarme a la sala"
- Verifica que WebSocket esté corriendo
- Comprueba `NEXT_PUBLIC_SOCKET_URL` es correcto
- Revisa la consola del navegador para errores

### "Los otros jugadores no ven mis movimientos"
- Asegúrate que los eventos Socket.io se emiten correctamente
- Verifica que todos están subscriptos al mismo `room-id`

### "La obra se muestra para el impostor"
- Revisa la lógica en `components/game/artwork-reveal.tsx`
- Confirma que `role` se asigna correctamente

## 📚 Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 Licencia

MIT

---

**¿Preguntas?** Abre un issue en el repositorio.
