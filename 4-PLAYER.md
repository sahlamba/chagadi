# 4-Player Mode

## Design Decisions

| Aspect | 6-player (existing) | 4-player (new) |
|---|---|---|
| Deck | 48 cards (no 2's) | 52 cards (full deck) |
| Cards per player | 8 (5 visible, 3 hidden) | 13 (8 visible, 5 hidden) |
| Turns | 8 | 13 |
| Cards per trick | 6 | 4 |
| Allies called | 2 cards → 3v3 | 1 card → 2v2 |
| Bid range | 280–508 | 280–508 (same for now) |
| Mode selection | Admin picks at game creation | Admin picks at game creation |

## Code Changes

### Server

**`server/chagadi/models/Game.js`** — main changes:
- Replace hardcoded constants with config derived from `settings.maxPlayers`:
  ```
  6p: PLAYER_COUNT=6, DECK_FILTER=no 2's, BIDDING_CARDS=5, HIDDEN_CARDS=3, TOTAL_TURNS=8, ALLY_COUNT=2
  4p: PLAYER_COUNT=4, DECK_FILTER=none,   BIDDING_CARDS=8, HIDDEN_CARDS=5, TOTAL_TURNS=13, ALLY_COUNT=1
  ```
- `constructor()` — store `this.playerCount` from settings
- `dealCards()` — conditionally filter 2's only for 6p; use config for bidding/hidden split
- `selectAllies(player, ...cards)` — accept 1 card for 4p, 2 for 6p; `leaderTeam` size 2 or 3
- `playCard()` — turn completion check: `playedCards.length === this.playerCount`
- `startNewTurn()` — play order loops over `this.playerCount`
- `resolveTurn()` — game over when `turnNumber >= totalTurns` (13 for 4p)

### Client

**`client/src/components/Home/CreateGameInput.js`**:
- Add radio/toggle: "4 players" or "6 players"
- Pass selected value as `maxPlayers` in `gameSettings`
- Update modal text dynamically

**`client/src/components/Game/GameSelectAlliesUI/index.js`**:
- Read `game.settings.maxPlayers` to determine pick count (1 vs 2)
- Adjust "Tap N cards" label and confirm button logic

**`client/src/components/Game/GamePlayUI/index.js`**:
- Turn counter: use `game.settings` to show correct total (13 vs 8)
  - Or derive from `playerCount`: cards per player = total cards / players = turns

**`client/src/components/Game/GameBiddingUI/index.js`**:
- No changes needed — hand display comes from server state (visible/hidden already set)

**`client/src/components/Game/TableLayout.js`**:
- No changes needed — already renders opponents dynamically

**`client/src/context/GameContext.js`**:
- No changes needed

### Files to touch

| File | Change |
|---|---|
| `server/chagadi/models/Game.js` | Config-driven constants, conditional deck, ally count, turn count |
| `client/src/components/Home/CreateGameInput.js` | Player count selector |
| `client/src/components/Game/GameSelectAlliesUI/index.js` | 1 vs 2 ally picks |
| `client/src/components/Game/GamePlayUI/index.js` | Dynamic turn total |
| Tests | Cover both 4p and 6p paths |
