# 🎨 MAC Impostor Game - Juego Multijugador en Tiempo Real

Un juego tipo "Impostor" inspirado en el Museo de Arte Contemporáneo (MAC). Cada partida enfrenta a inocentes contra impostores: solo quienes no son impostores acceden a la obra real y deben describirla para desenmascarar a los impostores en rondas y votaciones.

## 🧭 Tabla de Contenidos

1. [Resumen del Juego](#-resumen-del-juego)
2. [Reglas de Impostores](#-regla-de-impostores)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Base de Datos](#-estructura-de-base-de-datos)
6. [Tiempo Real](#-configuración-multijugador)
7. [Cómo Correr el Proyecto](#-cómo-correr-el-proyecto)
8. [Flujo Detallado de Partida](#-flujo-detallado-de-partida)
9. [Reglas de Negocio y Eventos](#-reglas-de-negocio-clave)
10. [Despliegue y Troubleshooting](#-despliegue)

## 🎮 Resumen del Juego

### Flujo General
1. **Página de Entrada**: Crea una sala nueva o únete con un código existente.
2. **Lobby**: Espera a reunir al menos 3 jugadores (sin límite máximo). El host controla el inicio.
3. **Asignación de Roles**: El backend calcula cuántos impostores corresponden y asigna roles.
4. **Selección de Sector y Obra**: Se toma un sector aleatorio del MAC y se elige una obra representativa.
5. **Revelación (solo inocentes)**: Ven la obra durante 5 segundos. Impostores solo saben el sector.
6. **Rondas de Descripción**: Los jugadores comparten pistas. El impostor improvisa.
7. **Votación**: Cada jugador vota a quien cree impostor; empate = nadie sale.
8. **Resultado**: Se revela el impostor, se otorgan puntos y se prepara la siguiente ronda o finaliza la partida.

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

## 🧩 Reglas de negocio clave

- **Impostores por grupo**: `impostores = max(1, floor((jugadores - 1) / 3) + 1)`. Ejemplos: 3-5 jugadores → 1 impostor; 6-8 → 2 impostores; 9-11 → 3 impostores; etc.
- **Sectores del MAC**: cada partida elige un sector aleatorio (1, 2 o 3) y se selecciona una obra aleatoria de ese sector.
- **Revelación de obra**: solo inocentes ven la imagen y el nombre por 5 segundos; impostores no reciben información visual.
- **Rondas**: cada jugador tiene 1 turno de ~15 segundos para compartir una característica; el impostor improvisa.
- **Votación**: todos votan simultáneamente; empate = nadie eliminado.

## 🧭 Flujo detallado de partida

1. **Lobby**
   - Crear sala (`POST /api/rooms`) → responder código de 6 caracteres.
   - Unirse con código (`POST /api/rooms/[code]/join`).
   - Escuchar `player-joined` por WebSocket para actualizar el listado.
2. **Inicio**
   - El host pulsa “Iniciar”. Backend calcula impostores con la regla anterior y publica `game-started` con roles (solo al jugador) y sector.
3. **Revelación**
   - Backend envía `artwork-revealed` a inocentes con `{title?, imageUrl, sector, characteristics}` y a impostores solo `{sector}`.
   - Frontend muestra un temporizador de 5s y luego oculta la imagen.
4. **Rondas de descripción**
   - Orden de turnos en servidor para evitar conflictos. Evento `round-started` con `currentPlayerId`.
   - Cada turno dura 15s; el cliente envía `describe` o expira con `round-ended`.
5. **Votación**
   - Evento `voting-started`; UI muestra botones de jugadores vivos.
   - Enviar `vote` al servidor; cuando todos votan o expira el timer (30s) se emite `voting-ended` con resultados.
6. **Resultado / siguiente ronda**
   - Si queda más de 1 impostor y hay suficientes jugadores, repetir pasos 3-5.
   - Evento `game-ended` con ganador y resumen.

## 🔌 Contratos de eventos (sugeridos)

```jsonc
// player-joined
{ "roomId": "uuid", "players": Player[] }

// game-started (enviado a cada socket con su rol)
{ "roomId": "uuid", "role": "innocent" | "impostor", "sector": 1 | 2 | 3 }

// artwork-revealed (a inocentes)
{ "artworkId": "uuid", "title": "string?", "imageUrl": "string", "sector": 1, "characteristics": string[] }

// round-started
{ "turnPlayerId": "uuid", "turnEndsAt": "timestamp" }

// voting-ended
{ "votes": { "targetId": "uuid", "count": number }[], "eliminatedId": "uuid | null" }
```

## 🛠️ Pasos recomendados de desarrollo

1. **Modelar tipos compartidos** en `lib/types.ts` para `Room`, `Player`, `GameState`, `Artwork`, `SocketEvents`.
2. **Configurar base de datos** con los scripts SQL y cargar obras (especialmente sin título) en `public/artworks`.
3. **Implementar endpoints REST** descritos en la sección de estructura (`rooms`, `games`, `vote`, etc.) con validación de roles.
4. **Montar servidor WebSocket** (Socket.io en `/api/ws`) y enviar los eventos anteriores; bloquear acciones si la sala no está en estado válido.
5. **Crear hooks de cliente** (`use-websocket`, `use-game`) que escuchen eventos y sincronicen el estado global (Zustand o Context).
6. **Construir vistas**: entrada (crear/unirse), lobby, reveal con temporizador, ronda con mic/textarea, panel de votación, pantalla final.
7. **Pruebas locales**: abrir 3 pestañas en modo incógnito, crear sala y simular flujo completo verificando timers y reconexión.

## 🧪 Escenarios críticos a validar

- Recalcular impostores si alguien abandona antes de iniciar; si ocurre durante la partida, mantener el rol pero excluir de votación.
- Si un jugador se desconecta durante su turno, saltar al siguiente tras 5s de gracia.
- Evitar dobles votos y envíos fuera de tiempo (validar en servidor con estado y timestamps).
- Confirmar que impostores nunca reciben `artwork-revealed` completo ni caché del navegador (usar `no-store`).

## 🚀 Despliegue

- **Backend**: Vercel / Railway para Next.js + Socket.io (activar `edge: false` en handler WS).
- **Base de datos**: Neon / Supabase con SSL habilitado.
- **Env vars**: `DATABASE_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_WS_PATH`, `NEXT_PUBLIC_ROOM_CODE_LENGTH`.
- **CDN de imágenes**: subir obras a storage (Vercel Blob / Supabase Storage) y usar URLs absolutas.

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
- Node.js 18 o superior y npm/pnpm.
- (Opcional) PostgreSQL si quieres persistencia real; por defecto el backend usa `rooms-store` en memoria.
- Dos terminales disponibles para correr el servidor WebSocket y Next.js.

### 1. Clonar e instalar dependencias
```bash
git clone <repo>
cd mac-impostor-game

# React 19 + vaul requieren legacy peer deps por ahora
npm install --legacy-peer-deps
# o pnpm install --legacy-peer-deps
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```
Variables mínimas:
```bash
# Base de datos (puede omitirse si usas almacenamiento en memoria)
DATABASE_URL=postgresql://user:password@localhost:5432/mac_impostor

# Socket.io local
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Sesión (solo si integras auth)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. (Opcional) Inicializar base de datos
```bash
psql -U user -d mac_impostor -f scripts/init-db.sql
psql -U user -d mac_impostor -f scripts/seed-artworks.sql
```

### 4. Levantar servicios en desarrollo
1. **Servidor de sockets** (terminal A)
   ```bash
   node server-socket.js
   ```
   Esto abre `ws://localhost:4000` y reenvía eventos `player-joined`, `game-started`, etc.

2. **Next.js + API** (terminal B)
   ```bash
   npm run dev
   ```
   La app queda en [http://localhost:3000](http://localhost:3000). Abre varias ventanas incógnitas para simular jugadores.

### 5. Comandos útiles
- `npm run lint` – Verifica el código.
- `npm run build && npm run start` – Build y modo producción.
- `npm run dev -- --turbo` – Opcional si usas la caché de Next.

### 6. Alternativa: correr todo con Docker
1. Copia los archivos `Dockerfile.next`, `Dockerfile.socket` y `docker-compose.yml` (incluidos en el repo).
2. Ajusta `.env.local` para que `NEXT_PUBLIC_SOCKET_URL=http://socket:4000` (el compose ya lo sobreescribe).
3. Ejecuta:
   ```bash
   docker-compose up --build
   ```
   Esto levanta dos contenedores: `app` (Next.js en el puerto 3000) y `socket` (Socket.io en el 4000). Puedes exponer los puertos como necesites (ej. `- "80:3000"`).

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
