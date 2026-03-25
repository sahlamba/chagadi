import { customAlphabet } from 'nanoid'
import Card, { Rank, Suit, getRank } from './Card.js'
import Deck, { Hand } from './Deck.js'
import PlayerState from './PlayerState.js'

const GAME_CODE_LENGTH = 6
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', GAME_CODE_LENGTH)

const MIN_BID = 280
const MAX_BID = 508

// Config per player count
const MODE = {
  4: { playerCount: 4, deckFilter: null, biddingCards: 8, hiddenCards: 5, totalTurns: 13, allyCount: 1 },
  6: { playerCount: 6, deckFilter: 'TWO', biddingCards: 5, hiddenCards: 3, totalTurns: 8, allyCount: 2 },
}
const getMode = (maxPlayers) => MODE[maxPlayers] || MODE[6]

export const GameState = {
  CREATED: 'CREATED',
  READY_TO_START: 'READY_TO_START',
  BIDDING: 'BIDDING',
  SELECTING_TRUMP: 'SELECTING_TRUMP',
  SELECTING_ALLIES: 'SELECTING_ALLIES',
  PLAYING: 'PLAYING',
  OVER: 'OVER',
}

// Valid transitions
const transitions = {
  CREATED: ['READY_TO_START'],
  READY_TO_START: ['BIDDING'],
  BIDDING: ['SELECTING_TRUMP'],
  SELECTING_TRUMP: ['SELECTING_ALLIES'],
  SELECTING_ALLIES: ['PLAYING'],
  PLAYING: ['OVER'],
  OVER: [],
}

export default class Game {
  constructor(admin, settings) {
    const mode = getMode(settings?.maxPlayers)
    this.code = nanoid()
    this.admin = admin
    this.settings = { ...settings, maxPlayers: mode.playerCount }
    this.state = GameState.CREATED
    this.players = {}       // Map<playerId, PlayerState>
    this.winnerId = null

    // Chagadi-specific state
    this.bids = {}          // Map<playerId, number>
    this.leaderId = null
    this.trumpSuit = null
    this.trumpRevealed = false
    this.leaderTeam = []
    this.turnNumber = 0
    this.currentTurn = null // { playOrder, playedCards, leadSuit, trumpRevealedBy }
    this.lastTurnResult = null // { winnerId, trickPoints, leaderTeamScore, enemyTeamScore }
  }

  static from(json) {
    const game = Object.create(Game.prototype)
    Object.assign(game, json)
    // Reconstitute PlayerState instances so getters (totalScore) work
    for (const pid of Object.keys(game.players || {})) {
      game.players[pid] = PlayerState.from(game.players[pid])
    }
    return game
  }

  get mode() { return getMode(this.settings?.maxPlayers) }

  // ── State machine ──

  transition(next) {
    if (!transitions[this.state]?.includes(next)) {
      throw new Error(`Invalid transition: ${this.state} → ${next}`)
    }
    this.state = next
  }

  requireState(expected) {
    if (this.state !== expected) {
      throw new Error(`Expected state ${expected}, got ${this.state}`)
    }
  }

  // ── Room lobby (boilerplate) ──

  addPlayer(player) {
    this.requireState(GameState.CREATED)
    const { playerCount } = this.mode
    if (Object.keys(this.players).length >= playerCount) {
      throw new Error(`Max players (${playerCount}) reached`)
    }
    this.players[player.id] = new PlayerState(player)
  }

  readyPlayer(player) {
    this.requireState(GameState.CREATED)
    this.validatePlayerExists(player)
    const ps = PlayerState.from(this.players[player.id])
    ps.setIsReady()
    this.players[player.id] = ps
    if (this.readyToStart()) {
      this.transition(GameState.READY_TO_START)
    }
  }

  startGame() {
    this.requireState(GameState.READY_TO_START)
    this.dealCards()
    this.transition(GameState.BIDDING)
  }

  readyToStart() {
    return (
      this.state === GameState.CREATED &&
      this.joinedPlayerCount() === this.mode.playerCount &&
      Object.values(this.players).every((ps) => ps.isReady)
    )
  }

  joinedPlayerCount() {
    return Object.keys(this.players).length
  }

  // ── Deal ──

  dealCards() {
    const { playerCount, deckFilter, biddingCards, hiddenCards } = this.mode
    let deck = Deck.standard()
    if (deckFilter) deck = deck.filter((c) => c.rank !== deckFilter)
    deck = deck.shuffle()

    const biddingHands = deck.deal(playerCount, biddingCards)
    const hiddenHands = deck.deal(playerCount, hiddenCards)

    // Shuffle assignment order
    const indices = Array.from({ length: playerCount }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }

    const playerIds = Object.keys(this.players)
    playerIds.forEach((pid, i) => {
      const ps = PlayerState.from(this.players[pid])
      const hand = new Hand()

      biddingHands[indices[i]].cards.forEach((c) => hand.addCard(c))

      hiddenHands[indices[i]].cards.forEach((c) => {
        c.visible = false
        hand.addCard(c)
      })

      ps.hand = hand
      this.players[pid] = ps
    })
  }

  // ── Bidding ──

  placeBid(player, amount) {
    this.requireState(GameState.BIDDING)
    this.validatePlayerExists(player)
    if (amount < MIN_BID || amount > MAX_BID) {
      throw new Error(`Bid must be ${MIN_BID}–${MAX_BID}, got ${amount}`)
    }
    this.bids[player.id] = amount
  }

  cancelBid(player) {
    this.requireState(GameState.BIDDING)
    this.validatePlayerExists(player)
    delete this.bids[player.id]
  }

  finalizeBidding(leaderId) {
    this.requireState(GameState.BIDDING)
    if (!this.players[leaderId]) {
      throw new Error(`Unknown player: ${leaderId}`)
    }
    this.leaderId = leaderId

    // Reveal all hidden cards
    for (const ps of Object.values(this.players)) {
      if (ps.hand?.cards) {
        ps.hand.cards.forEach((c) => { c.visible = true })
      }
    }

    this.transition(GameState.SELECTING_TRUMP)
  }

  getHighestBidder() {
    let highestId = null
    let highestBid = 0
    for (const [pid, amount] of Object.entries(this.bids)) {
      if (amount > highestBid) {
        highestBid = amount
        highestId = pid
      }
    }
    return highestId
  }

  getHighestBid() {
    return Math.max(0, ...Object.values(this.bids))
  }

  // ── Trump selection ──

  selectTrumpSuit(player, suitName) {
    this.requireState(GameState.SELECTING_TRUMP)
    if (player.id !== this.leaderId) {
      throw new Error('Only the leader can select trump suit')
    }
    if (!Suit[suitName]) {
      throw new Error(`Invalid suit: ${suitName}`)
    }
    this.trumpSuit = suitName
    this.transition(GameState.SELECTING_ALLIES)
  }

  // ── Ally selection ──

  selectAllies(player, ...allyCards) {
    this.requireState(GameState.SELECTING_ALLIES)
    if (player.id !== this.leaderId) {
      throw new Error('Only the leader can select allies')
    }

    const { allyCount } = this.mode
    if (allyCards.length !== allyCount) {
      throw new Error(`Must select exactly ${allyCount} ally card(s)`)
    }

    const leaderHand = this.players[this.leaderId].hand
    const allyIds = []
    for (const card of allyCards) {
      if (this.handHasCard(leaderHand, card)) {
        throw new Error('Ally cards must not be from your own hand')
      }
      const holderId = this.findCardHolder(card, this.leaderId)
      if (!holderId) {
        throw new Error('Ally cards must exist in another player\'s hand')
      }
      allyIds.push(holderId)
    }

    this.leaderTeam = [this.leaderId, ...allyIds]

    // Assign teams
    for (const pid of Object.keys(this.players)) {
      this.players[pid].team = this.leaderTeam.includes(pid) ? 'leader' : 'enemy'
    }

    this.startNewTurn(this.leaderId)
    this.transition(GameState.PLAYING)
  }

  // ── Turn mechanics ──

  playCard(player, card) {
    this.requireState(GameState.PLAYING)
    const turn = this.currentTurn

    if (player.id !== turn.playOrder[turn.playedCards.length]) {
      throw new Error(`Not ${player.name || player.id}'s turn`)
    }

    const ps = this.players[player.id]
    if (!this.handHasCard(ps.hand, card)) {
      throw new Error(`Player doesn't hold that card`)
    }

    // Suit-following validation
    if (turn.leadSuit) {
      const hasSuit = ps.hand.cards.some((c) => c.suit === turn.leadSuit)
      if (hasSuit && card.suit !== turn.leadSuit) {
        throw new Error(`Must follow lead suit ${turn.leadSuit}`)
      }
      // If player revealed trump, must play trump if they have it
      if (!hasSuit && turn.trumpRevealedBy === player.id) {
        const hasTrump = ps.hand.cards.some((c) => c.suit === this.trumpSuit)
        if (hasTrump && card.suit !== this.trumpSuit) {
          throw new Error('Must play trump suit after revealing it')
        }
      }
    }

    // Play the card
    if (!turn.leadSuit) {
      turn.leadSuit = card.suit
    }
    turn.playedCards.push({ playerId: player.id, card })
    this.removeCardFromHand(ps.hand, card)

    // If turn complete, resolve
    if (turn.playedCards.length === this.mode.playerCount) {
      return this.resolveTurn()
    }
    return null
  }

  requestTrumpReveal(player) {
    this.requireState(GameState.PLAYING)
    if (this.trumpRevealed) return

    const turn = this.currentTurn
    if (player.id !== turn.playOrder[turn.playedCards.length]) {
      throw new Error(`Not ${player.name || player.id}'s turn`)
    }

    const ps = this.players[player.id]
    if (ps.hand.cards.some((c) => c.suit === turn.leadSuit)) {
      throw new Error('Cannot reveal trump when you have the lead suit')
    }

    this.trumpRevealed = true
    turn.trumpRevealedBy = player.id
  }

  // ── Scoring ──

  getTeamScore(team) {
    return Object.values(this.players)
      .filter((ps) => ps.team === team)
      .reduce((sum, ps) => sum + ps.totalScore, 0)
  }

  get leaderTeamScore() { return this.getTeamScore('leader') }
  get enemyTeamScore() { return this.getTeamScore('enemy') }

  // ── Internal helpers ──

  resolveTurn() {
    const turn = this.currentTurn
    const winnerId = this.resolveWinner(turn)
    const trickCards = turn.playedCards.map((pc) => Card.from(pc.card))

    const winnerPs = PlayerState.from(this.players[winnerId])
    winnerPs.addWonTrick(trickCards)
    this.players[winnerId] = winnerPs

    this.turnNumber++

    const result = {
      winnerId,
      trickPoints: trickCards.reduce((s, c) => s + c.points, 0),
      leaderTeamScore: this.leaderTeamScore,
      enemyTeamScore: this.enemyTeamScore,
      gameOver: false,
    }

    this.lastTurnResult = result

    if (this.turnNumber >= this.mode.totalTurns) {
      this.state = GameState.OVER
      // Leader team wins if score >= bid
      const leaderWins = this.leaderTeamScore >= this.getHighestBid()
      this.winnerId = leaderWins ? 'leader' : 'enemy'
      result.gameOver = true
    } else {
      this.startNewTurn(winnerId)
    }

    return result
  }

  resolveWinner(turn) {
    let winnerId = turn.playedCards[0].playerId
    let winningCard = turn.playedCards[0].card

    for (let i = 1; i < turn.playedCards.length; i++) {
      const { playerId, card } = turn.playedCards[i]
      if (this.beats(card, winningCard, turn.leadSuit)) {
        winnerId = playerId
        winningCard = card
      }
    }
    return winnerId
  }

  beats(challenger, current, leadSuit) {
    const cIsTrump = this.trumpRevealed && challenger.suit === this.trumpSuit
    const wIsTrump = this.trumpRevealed && current.suit === this.trumpSuit

    if (cIsTrump && !wIsTrump) return true
    if (!cIsTrump && wIsTrump) return false

    // Both trump — lower trumpOrder wins
    if (cIsTrump) {
      return getRank(challenger.rank).trumpOrder < getRank(current.rank).trumpOrder
    }

    // Neither trump — only lead suit matters
    const cIsLead = challenger.suit === leadSuit
    const wIsLead = current.suit === leadSuit

    if (cIsLead && !wIsLead) return true
    if (!cIsLead && wIsLead) return false
    if (cIsLead) {
      return getRank(challenger.rank).trumpOrder < getRank(current.rank).trumpOrder
    }

    return false // both off-suit non-trump: current holds
  }

  startNewTurn(leaderId) {
    const playerIds = Object.keys(this.players)
    const leaderIdx = playerIds.indexOf(leaderId)
    const { playerCount } = this.mode
    const playOrder = []
    for (let i = 0; i < playerCount; i++) {
      playOrder.push(playerIds[(leaderIdx + i) % playerCount])
    }
    this.currentTurn = {
      playOrder,
      playedCards: [],    // [{ playerId, card }]
      leadSuit: null,
      trumpRevealedBy: null,
    }
  }

  handHasCard(hand, card) {
    return hand?.cards?.some((c) => c.suit === card.suit && c.rank === card.rank)
  }

  removeCardFromHand(hand, card) {
    const idx = hand.cards.findIndex((c) => c.suit === card.suit && c.rank === card.rank)
    if (idx !== -1) hand.cards.splice(idx, 1)
  }

  findCardHolder(card, excludePlayerId) {
    for (const [pid, ps] of Object.entries(this.players)) {
      if (pid === excludePlayerId) continue
      if (this.handHasCard(ps.hand, card)) return pid
    }
    return null
  }

  validatePlayerExists(player) {
    if (!this.players[player.id]) {
      throw new Error(`Player ${player.id} not in game`)
    }
  }
}
