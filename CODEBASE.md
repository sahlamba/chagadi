# Codebase Overview — Real-Time Game Rooms

A multiplayer real-time game rooms boilerplate built with Node.js, Express, Socket.io, and a React (Chakra UI) frontend. It provides the scaffolding for creating lobby-based multiplayer games where players join rooms, ready up, and submit gameplay input in real time.

## Architecture

The project is split into three decoupled layers:

```
┌──────────────────────────────────────────────────────┐
│                   React Client (CRA)                 │
│  Chakra UI · React Router · Socket.io-client         │
├──────────────────────────────────────────────────────┤
│              Express API + Socket.io Server          │
│  REST endpoints (game CRUD) + WebSocket events       │
├──────────────────────────────────────────────────────┤
│                    Game Engine                       │
│  In-memory DB (LokiJS) · Game/PlayerState models     │
└──────────────────────────────────────────────────────┘
```

### Server (`server/`)

| Component | Path | Purpose |
|---|---|---|
| Entry point | `server/index.js` | Express + HTTP server setup, serves static React build in production |
| REST controllers | `server/controllers/game.js`, `player.js` | `GET /api/game`, `POST /api/game`, `GET /api/game/player/games` |
| Socket.io layer | `server/socketio/` | Real-time events: `connect_player`, `disconnect_player`, `join_game`, `ready_player`, `start_game`, `gameplay_input` |
| Game engine | `server/game-engine/index.js` | Stateless facade over the DB — creates games, joins players, manages state transitions |
| In-memory DB | `server/game-engine/db.js` | LokiJS with two collections: `games` and `player_games` |
| Models | `server/game-engine/models/` | `Game` (code, admin, state machine, players map, winner) and `PlayerState` (player ref, ready flag, turn results) |
| Validation | `server/utils/validation.js` | Lightweight checks for game code, player object, and settings |

### Client (`client/`)

| Component | Path | Purpose |
|---|---|---|
| Entry / Routing | `client/src/App.js` | Three routes: `/` (Home), `/player` (Register), `/game/:gameCode` (Game room) |
| Player context | `client/src/context/PlayerContext.js` | Creates a UUID-based player, persists to localStorage, auto-redirects unregistered users to `/player` |
| Game context | `client/src/context/GameContext.js` | Manages Socket.io connection, exposes game actions (join, ready, start, submit input), listens for server broadcasts |
| API client | `client/src/utils/apiClient.js` | Fetch wrappers for the REST endpoints |
| Models | `client/src/models/` | `Player` (UUID + name) and `GameSettings` (maxPlayers) |
| UI components | `client/src/components/` | Home (create/join game), RegisterPlayer (name input), Game (lobby states, gameplay, game over) |

## Game Lifecycle

```
CREATED ──▶ READY_TO_START ──▶ PLAYING ──▶ OVER
```

1. **CREATED** — Admin creates a game room via REST. A 6-char alphanumeric code is generated (nanoid). Other players join via that code.
2. **READY_TO_START** — Once all players (up to `maxPlayers`) have joined AND marked themselves ready, the state auto-transitions.
3. **PLAYING** — Only the admin can trigger `start_game`. Players submit gameplay input in real time (not turn-based). Each input is evaluated with a random win condition (boilerplate placeholder).
4. **OVER** — A winner is determined when `isWinning` resolves to true. The winner's ID is stored on the game.

## Real-Time Communication

All gameplay interactions after game creation flow through Socket.io:

| Client Event | Server Handler | Broadcast |
|---|---|---|
| `connect_player` | Joins socket room | — |
| `disconnect_player` | Leaves socket room | — |
| `join_game` | Adds player to game | `player_joined_game` |
| `ready_player` | Marks player ready | `player_ready_in_game` |
| `start_game` | Transitions to PLAYING | `game_started` |
| `gameplay_input` | Processes input, checks win | `player_submitted_gameplay_input` |

## Data Storage

All data lives in-memory via LokiJS (no persistence across server restarts). Two collections:
- `games` — keyed by game `code`
- `player_games` — keyed by `playerId:gameCode` composite, tracks which games a player has joined

## Player Identity

Players are created entirely client-side: a UUID is generated and a name is either user-provided or randomly generated (adjective-animal pattern). The player object is persisted in the browser's `localStorage`. The server only validates that a `player.id` exists — there is no authentication.

## How to Run

```bash
npm run setup   # Install all dependencies (root, server, client)
npm run dev     # Concurrently starts server (nodemon, port 8080) + client (CRA, port 3000)
npm start       # Production: builds client, serves everything from Express on port 8080
```

## Key Design Decisions

- **Boilerplate-first**: The gameplay logic (`acceptGameplayInput`) uses a random coin flip for win detection — meant to be replaced with actual game rules.
- **No auth**: Player identity is a client-side UUID. The server trusts it.
- **No persistence**: LokiJS runs purely in-memory. Games are lost on restart.
- **Decoupled layers**: REST for game creation/lookup, WebSockets for all real-time state changes. The game engine is independent of both transport layers.
- **Multi-room support**: A single player can be in multiple game rooms simultaneously.
