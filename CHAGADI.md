# Chagadi — Implementation Plan

## Game Overview

6-player trick-taking card game. A bidding winner (leader) secretly picks 2 allies → 3v3 teams. 8 turns of trick play. Leader's team must score ≥ their bid to win.

## Server Directory: `server/chagadi/`

Ported from Java (`JavaSandbox/Chagadi/src/game/`).

```
server/chagadi/
├── index.js              # Chagadi engine facade (like Jotto.js)
├── db.js                 # LokiJS in-memory DB (copied from boilerplate)
└── models/
    ├── Game.js            # Game lifecycle, state machine, all phase logic
    ├── PlayerState.js     # Per-player state: hand, tricks, score, team
    ├── Card.js            # Card class (suit + rank + properties)
    ├── Deck.js            # Deck: shuffle, deal, cut
    └── Hand.js            # Hand: card collection, add/remove/sort
```

## Game State Machine

```
CREATED → READY_TO_START → BIDDING → SELECTING_TRUMP → SELECTING_ALLIES → PLAYING → OVER
         (room lobby)      (game-specific phases below)
```

Room phases (`CREATED`, `READY_TO_START`) are inherited from the boilerplate.
Game phases (`BIDDING` → `OVER`) are Chagadi-specific.

## Phases

### Phase 0: Room Lobby (boilerplate)
- Admin creates game (maxPlayers fixed to 6)
- Players join via game code, click ready
- Admin starts game → transitions to BIDDING

### Phase 1: BIDDING
- Each player sees their 5 visible cards (3 remain hidden)
- Players place bids (280–508) or pass
- Server tracks highest bidder
- Admin (or timer) finalizes bidding → leader is selected
- Hidden cards revealed to each player
- → SELECTING_TRUMP

### Phase 2: SELECTING_TRUMP
- Only the leader can act
- Leader picks a trump suit (♣ ♥ ♠ ♦)
- Trump suit is stored but NOT revealed to other players yet
- → SELECTING_ALLIES

### Phase 3: SELECTING_ALLIES
- Only the leader can act
- Leader sees all other players' cards
- Leader picks 2 cards → holders of those cards become secret allies
- Teams formed: leader + 2 allies vs 3 enemies
- Each player is told their team role privately
- → PLAYING

### Phase 4: PLAYING (8 turns)
- Turn leader plays a card (sets lead suit)
- Remaining 5 players play clockwise, must follow suit if possible
- If can't follow suit: may request trump reveal, then must play trump if available
- Turn winner = highest lead-suit card, or highest trump if trumped
- Winner leads next turn
- After 8 turns → OVER

### Phase 5: OVER
- Leader team score vs enemy team score
- Leader wins if team score ≥ bid

## Socket Events

| Client Event | Phase | Data |
|---|---|---|
| `connect_player` | any | `{ gameCode, player }` |
| `disconnect_player` | any | `{ gameCode, player }` |
| `join_game` | CREATED | `{ gameCode, player }` |
| `ready_player` | CREATED | `{ gameCode, player }` |
| `start_game` | READY_TO_START | `{ gameCode }` |
| `place_bid` | BIDDING | `{ gameCode, player, amount }` |
| `cancel_bid` | BIDDING | `{ gameCode, player }` |
| `finalize_bidding` | BIDDING | `{ gameCode, leaderId }` |
| `select_trump` | SELECTING_TRUMP | `{ gameCode, player, suitName }` |
| `select_allies` | SELECTING_ALLIES | `{ gameCode, player, card1, card2 }` |
| `play_card` | PLAYING | `{ gameCode, player, card }` |
| `request_trump_reveal` | PLAYING | `{ gameCode, player }` |

Server emits a single unified event to each player individually:

| Server Event | Data |
|---|---|
| `game_updated` | `{ gameState }` (per-player filtered) |

Filtering rules applied per-player in `emitToEachPlayer()`:
- Other players' hands → replaced with `{ cardCount }` only
- `trumpSuit` → `null` until `trumpRevealed` is true
- `leaderTeam` + player `team` → hidden from non-team members (unless OVER)

## Card Model

```
Suits: CLUBS(♣), HEARTS(♥), SPADES(♠), DIAMONDS(♦)
Ranks: A,3,4,5,6,7,8,9,10,J,Q,K (no 2's in play)
Points: A=1, 3-10=face, J=11, Q=50, K=13
Trump order (high→low): A,K,Q,J,10,9,8,7,6,5,4,3
Total cards: 48 (52 minus four 2's)
Cards per player: 8 (5 visible + 3 hidden initially)
```

## Per-Player State Filtering

The server must NOT broadcast raw game state. Each player gets a filtered view:
- Can only see own hand
- Cannot see other players' hidden cards
- Cannot see trump suit until revealed
- Cannot see ally identity (only knows own team role)
- Can see all played cards on the table during a turn

## Build Order

1. ✅ Plan (this file)
2. ✅ Card.js — Suit {name, symbol} enum + Rank {name, symbol, value, points, trumpOrder} enum + Card class
3. ✅ Deck.js + Hand — standard deck factory, shuffle, deal, filter; hand add/remove/hasSuit/merge/sort/points
4. ✅ PlayerState.js — per-player state: hand, tricks, score, team
5. ✅ Game.js — full game lifecycle, state machine, all phase logic (54 tests passing)
6. ✅ index.js + db.js — Chagadi engine facade + LokiJS in-memory DB
7. ✅ Socket events (listeners.js) — Chagadi events + per-player state filtering + controllers updated
8. Client UI — 4 sub-phases:

### 8a. Foundation (context + wiring)
- `GameContext.js` — replace boilerplate `gameplay_input` with Chagadi actions:
  `placeBid`, `cancelBid`, `finalizeBidding`, `selectTrump`, `selectAllies`,
  `playCard`, `requestTrumpReveal`. Listen for unified `game_updated` event.
  Add helpers: `getMyHand`, `isMyTurn`, `isLeader`, `getMyTeam`, `getCurrentTurn`.
- `GameContent.js` — add switch cases for `BIDDING`, `SELECTING_TRUMP`, `SELECTING_ALLIES`
- `Header.js` — rename title to "Chagadi"
- `CreateGameInput.js` — fix maxPlayers to 6, remove word length
- `GameSettings.js` — drop wordLength

### 8b. Bidding UI
- `GameBiddingUI/index.js` — show 5 visible + 3 hidden cards, bid input (280–508),
  place/cancel bid buttons, display all bids, admin finalize button

### 8c. Leader Phases UI
- `GameSelectTrumpUI/index.js` — 4 suit buttons (leader only), waiting message for others
- `GameSelectAlliesUI/index.js` — leader picks 2 ally cards from other hands, others wait

### 8d. Playing + Game Over UI
- Replace boilerplate `GamePlayUI/` — hand display, current trick (played cards),
  turn indicator, play card on click, trump reveal button, turn results
- `GameOverUI/` — final scores, winner, team reveal

## Table Layout (card-room POV)

Goal: make the UI feel like sitting at a real card table.

### Layout structure
```
              P3        P4
           P2               P5

          ┌─────────────────────┐
          │   Table / Trick      │
          │   (center area)      │
          └─────────────────────┘

             ╭── fan of cards ──╮
                  You (P1)
```

- Bottom: current player's hand in a fan/arc layout (CSS rotated cards, overlapping)
- Top half: 5 opponents arranged in a semicircle, each showing:
  - Avatar + name
  - Mini fan icon (2-3 fanned card backs representing their hand)
  - Card count
- Center: context-dependent content area:
  - BIDDING: bid controls + bid list
  - SELECTING_TRUMP: suit picker (leader) or waiting message
  - SELECTING_ALLIES: card grid (leader) or waiting message
  - PLAYING: played cards for current trick
  - OVER: final scores + team reveal

### Components
- `TableLayout.js` — main spatial container, positions seats + center + player hand
- `PlayerSeat.js` — single opponent: avatar, name, mini card fan, active turn highlight
- `FanHand.js` — current player's cards in a fan arc (CSS transforms: rotate + translate per card)

### Turn highlighting (PLAYING phase)
- Active player's seat gets a glow/border highlight
- Cards animate from hand → center trick area on play
- Clockwise visual flow around the semicircle

### Retrofit plan
1. First: build TableLayout + PlayerSeat + FanHand, wire into PLAYING phase
2. Then: retrofit BIDDING, SELECTING_TRUMP, SELECTING_ALLIES to render inside the table center area
3. All phases share the same table view — only the center content changes

### Mobile responsive
- Fan hand: fewer cards visible at once, tighter overlap, smaller card size on narrow screens
- Semicircle: collapse to a horizontal scroll row on small screens
- Center area: stack vertically, scrollable if needed
- Use Chakra `useBreakpointValue` for size/spacing breakpoints
- Touch targets: minimum 44px tap area on all interactive elements
- Card grid (ally selection): 2 suit rows visible at a time, scroll for rest

## Deployment

Host: `cloud.sahillamba.com` (nginx reverse proxy + Let's Encrypt SSL)
Path: `/chagadi` (same pattern as `/jotto`)
Port: `8081` (Jotto uses 8080)
Process manager: pm2

### Nginx location block (add to sites-enabled conf)
```nginx
location /chagadi {
    rewrite ^/chagadi/(.*)$ /$1 break;

    proxy_http_version 1.1;
    proxy_cache_bypass $http_upgrade;
    proxy_redirect off;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_pass http://localhost:8081;
}
```

### Server changes for deploy
- `server/index.js` — default port → 8081
- `server/socketio/index.js` — CORS origin: allow `cloud.sahillamba.com`
- `client/src/constants.js` — API_BASE_URL: use same origin (no hardcoded port)
- `client/package.json` — `"homepage": "/chagadi"` for correct asset paths
- pm2: `pm2 start server/index.js --name chagadi -- --port 8081`
