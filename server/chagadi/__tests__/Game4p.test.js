import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Game, { GameState } from '../models/Game.js'

const makePlayers = (n) =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Player${i}` }))

const createReadyGame = () => {
  const players = makePlayers(4)
  const game = new Game(players[0], { maxPlayers: 4 })
  players.forEach((p) => game.addPlayer(p))
  players.forEach((p) => game.readyPlayer(p))
  return { game, players }
}

const createBiddingGame = () => {
  const { game, players } = createReadyGame()
  game.startGame()
  return { game, players }
}

const setupPlayingGame = () => {
  const { game, players } = createBiddingGame()
  game.finalizeBidding(players[0].id)
  game.selectTrumpSuit(players[0], 'SPADES')
  const allyCard = game.players[players[1].id].hand.cards[0]
  game.selectAllies(players[0], allyCard)
  return { game, players }
}

const playTurn = (game) => {
  let result = null
  for (let i = 0; i < 4; i++) {
    const pid = game.currentTurn.playOrder[game.currentTurn.playedCards.length]
    const ps = game.players[pid]
    const leadSuit = game.currentTurn.leadSuit
    let card = ps.hand.cards[0]
    if (leadSuit) {
      const suitCard = ps.hand.cards.find((c) => c.suit === leadSuit)
      if (suitCard) card = suitCard
    }
    result = game.playCard({ id: pid }, card)
  }
  return result
}

describe('4-Player — Room Lobby', () => {
  it('starts with maxPlayers 4', () => {
    const game = new Game({ id: 'a', name: 'A' }, { maxPlayers: 4 })
    assert.equal(game.settings.maxPlayers, 4)
  })

  it('adds players up to 4', () => {
    const game = new Game({ id: 'a', name: 'A' }, { maxPlayers: 4 })
    makePlayers(4).forEach((p) => game.addPlayer(p))
    assert.equal(game.joinedPlayerCount(), 4)
  })

  it('rejects 5th player', () => {
    const game = new Game({ id: 'a', name: 'A' }, { maxPlayers: 4 })
    makePlayers(4).forEach((p) => game.addPlayer(p))
    assert.throws(() => game.addPlayer({ id: 'p4', name: 'Extra' }), /Max players/)
  })

  it('transitions to READY_TO_START when all 4 ready', () => {
    const { game } = createReadyGame()
    assert.equal(game.state, GameState.READY_TO_START)
  })

  it('deals 13 cards per player (8 visible + 5 hidden)', () => {
    const { game } = createBiddingGame()
    for (const ps of Object.values(game.players)) {
      assert.equal(ps.hand.cards.length, 13)
      assert.equal(ps.hand.cards.filter((c) => c.visible).length, 8)
      assert.equal(ps.hand.cards.filter((c) => !c.visible).length, 5)
    }
  })

  it('uses full 52-card deck (2s included)', () => {
    const { game } = createBiddingGame()
    const allCards = Object.values(game.players).flatMap((ps) => ps.hand.cards)
    assert.equal(allCards.length, 52)
    assert.ok(allCards.some((c) => c.rank === 'TWO'))
  })
})

describe('4-Player — Ally Selection', () => {
  it('leader selects 1 ally → 2v2 teams', () => {
    const { game, players } = setupPlayingGame()
    assert.equal(game.leaderTeam.length, 2)
    const leaders = Object.values(game.players).filter((ps) => ps.team === 'leader')
    const enemies = Object.values(game.players).filter((ps) => ps.team === 'enemy')
    assert.equal(leaders.length, 2)
    assert.equal(enemies.length, 2)
  })

  it('rejects selecting 2 allies in 4p mode', () => {
    const { game, players } = createBiddingGame()
    game.finalizeBidding(players[0].id)
    game.selectTrumpSuit(players[0], 'SPADES')
    const card1 = game.players[players[1].id].hand.cards[0]
    const card2 = game.players[players[2].id].hand.cards[0]
    assert.throws(() => game.selectAllies(players[0], card1, card2), /exactly 1/)
  })
})

describe('4-Player — Turn Mechanics', () => {
  it('turn has 4 players in play order', () => {
    const { game } = setupPlayingGame()
    assert.equal(game.currentTurn.playOrder.length, 4)
  })

  it('full turn resolves after 4 cards', () => {
    const { game } = setupPlayingGame()
    const result = playTurn(game)
    assert.ok(result)
    assert.ok(result.winnerId)
    assert.equal(game.turnNumber, 1)
    assert.equal(result.gameOver, false)
  })

  it('full game plays 13 turns and ends', () => {
    const { game } = setupPlayingGame()
    let result = null
    for (let turn = 0; turn < 13; turn++) {
      result = playTurn(game)
    }
    assert.ok(result.gameOver)
    assert.equal(game.state, GameState.OVER)
    assert.ok(game.winnerId === 'leader' || game.winnerId === 'enemy')
    // All cards played — hands should be empty
    for (const ps of Object.values(game.players)) {
      assert.equal(ps.hand.cards.length, 0)
    }
  })
})
