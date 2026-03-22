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

## Socket Events (to implement)

| Client Event | Phase | Data |
|---|---|---|
| `place_bid` | BIDDING | `{ gameCode, player, amount }` |
| `cancel_bid` | BIDDING | `{ gameCode, player }` |
| `finalize_bidding` | BIDDING | `{ gameCode }` (admin only) |
| `select_trump` | SELECTING_TRUMP | `{ gameCode, player, suit }` |
| `select_allies` | SELECTING_ALLIES | `{ gameCode, player, card1, card2 }` |
| `play_card` | PLAYING | `{ gameCode, player, card }` |
| `request_trump_reveal` | PLAYING | `{ gameCode, player }` |

| Server Broadcast | Data |
|---|---|
| `bid_placed` | `{ gameState }` (per-player filtered) |
| `bidding_finalized` | `{ gameState }` |
| `trump_selected` | `{ gameState }` |
| `allies_selected` | `{ gameState }` (per-player: team role) |
| `card_played` | `{ gameState }` |
| `trump_revealed` | `{ gameState }` |
| `turn_completed` | `{ gameState, turnResult }` |
| `game_over` | `{ gameState, finalScores }` |

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
8. Client UI — next
