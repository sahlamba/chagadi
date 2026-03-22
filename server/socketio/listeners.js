import Chagadi from '../chagadi/index.js'
import { validateGameCode, validatePlayer } from '../utils/validation.js'

const errorToJson = (e) => ({ name: e.name, message: e.message })

// ── Per-player state filtering ──
// Each player sees: own hand, other players' card counts (not cards),
// trump only if revealed, ally identity only if on leader team or game over.

const filterGameForPlayer = (gameCode, playerId) => {
  const game = Chagadi.getGame(gameCode)
  if (!game) return null

  const filtered = { ...game }

  // Filter player hands — hide other players' cards
  const players = {}
  for (const [pid, ps] of Object.entries(game.players)) {
    if (pid === playerId) {
      players[pid] = ps
    } else {
      players[pid] = {
        ...ps,
        hand: ps.hand ? { cardCount: ps.hand.cards?.length ?? 0 } : null,
      }
    }
  }
  filtered.players = players

  // Hide trump suit until revealed (leader always sees it)
  if (!game.trumpRevealed && playerId !== game.leaderId) {
    filtered.trumpSuit = null
  }

  // Hide leader team from non-team members (unless game over)
  if (game.state !== 'OVER' && !game.leaderTeam.includes(playerId)) {
    filtered.leaderTeam = []
    for (const pid of Object.keys(filtered.players)) {
      if (filtered.players[pid].team) {
        filtered.players[pid] = { ...filtered.players[pid], team: null }
      }
    }
  }

  return filtered
}

const emitToEachPlayer = (io, gameCode) => {
  const game = Chagadi.getGame(gameCode)
  if (!game) return
  const room = io.sockets.adapter.rooms.get(gameCode)
  if (!room) return

  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId)
    if (!socket?.playerId) continue
    socket.emit('game_updated', {
      gameState: filterGameForPlayer(gameCode, socket.playerId),
    })
  }
}

// ── Lobby events (same as boilerplate) ──

const onPlayerConnected = (_io, _socket, { gameCode, player }, callback) => {
  try {
    validateGameCode(gameCode)
    validatePlayer(player)
    _socket.join(gameCode)
    _socket.playerId = player.id
    callback()
  } catch (e) { callback(errorToJson(e)) }
}

const onPlayerDisconnected = (_io, _socket, { gameCode, player }) => {
  try {
    validateGameCode(gameCode)
    validatePlayer(player)
    _socket.leave(gameCode)
  } catch (e) { console.error(errorToJson(e)) }
}

const onPlayerJoinsGame = (_io, _socket, { gameCode, player }, callback) => {
  try {
    validateGameCode(gameCode)
    validatePlayer(player)
    Chagadi.joinGame(gameCode, player)
    _socket.join(gameCode)
    _socket.playerId = player.id
    emitToEachPlayer(_io, gameCode)
    callback()
  } catch (e) { callback(errorToJson(e)) }
}

const onPlayerReady = (_io, _socket, { gameCode, player }, callback) => {
  try {
    validateGameCode(gameCode)
    validatePlayer(player)
    Chagadi.readyPlayer(gameCode, player)
    emitToEachPlayer(_io, gameCode)
    callback()
  } catch (e) { callback(errorToJson(e)) }
}

const onStartGame = (_io, _socket, { gameCode }, callback) => {
  try {
    validateGameCode(gameCode)
    Chagadi.startGame(gameCode)
    emitToEachPlayer(_io, gameCode)
    callback()
  } catch (e) { callback(errorToJson(e)) }
}

// ── Chagadi-specific events ──

const onPlaceBid = (_io, _socket, { gameCode, player, amount }, callback) => {
  try {
    validateGameCode(gameCode)
    validatePlayer(player)
    Chagadi.placeBid(gameCode, player, amount)
    emitToEachPlayer(_io, gameCode)
    callback()
  } catch (e) { callback(errorToJson(e)) }
}

const onCancelBid = (_io, _socket, { gameCode, player }, callback) => {
  try {
    validateGameCode(gameCode)
    validatePlayer(player)
    Chagadi.cancelBid(gameCode, player)
    emitToEachPlayer(_io, gameCode)
    callback()
  } catch (e) { callback(errorToJson(e)) }
}

const onFinalizeBidding = (_io, _socket, { gameCode, leaderId }, callback) => {
  try {
    validateGameCode(gameCode)
    Chagadi.finalizeBidding(gameCode, leaderId)
    emitToEachPlayer(_io, gameCode)
    callback()
  } catch (e) { callback(errorToJson(e)) }
}

const onSelectTrump = (_io, _socket, { gameCode, player, suitName }, callback) => {
  try {
    validateGameCode(gameCode)
    validatePlayer(player)
    Chagadi.selectTrumpSuit(gameCode, player, suitName)
    emitToEachPlayer(_io, gameCode)
    callback()
  } catch (e) { callback(errorToJson(e)) }
}

const onSelectAllies = (_io, _socket, { gameCode, player, card1, card2 }, callback) => {
  try {
    validateGameCode(gameCode)
    validatePlayer(player)
    Chagadi.selectAllies(gameCode, player, card1, card2)
    emitToEachPlayer(_io, gameCode)
    callback()
  } catch (e) { callback(errorToJson(e)) }
}

const onPlayCard = (_io, _socket, { gameCode, player, card }, callback) => {
  try {
    validateGameCode(gameCode)
    validatePlayer(player)
    const result = Chagadi.playCard(gameCode, player, card)
    emitToEachPlayer(_io, gameCode)
    callback(null, result)
  } catch (e) { callback(errorToJson(e)) }
}

const onRequestTrumpReveal = (_io, _socket, { gameCode, player }, callback) => {
  try {
    validateGameCode(gameCode)
    validatePlayer(player)
    Chagadi.requestTrumpReveal(gameCode, player)
    emitToEachPlayer(_io, gameCode)
    callback()
  } catch (e) { callback(errorToJson(e)) }
}

export const GameServerEvents = [
  { name: 'connect_player', listener: onPlayerConnected },
  { name: 'disconnect_player', listener: onPlayerDisconnected },
  { name: 'join_game', listener: onPlayerJoinsGame },
  { name: 'ready_player', listener: onPlayerReady },
  { name: 'start_game', listener: onStartGame },
  { name: 'place_bid', listener: onPlaceBid },
  { name: 'cancel_bid', listener: onCancelBid },
  { name: 'finalize_bidding', listener: onFinalizeBidding },
  { name: 'select_trump', listener: onSelectTrump },
  { name: 'select_allies', listener: onSelectAllies },
  { name: 'play_card', listener: onPlayCard },
  { name: 'request_trump_reveal', listener: onRequestTrumpReveal },
]
