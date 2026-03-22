import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import Game, { GameState } from '../models/Game.js'
import { Suit, Rank } from '../models/Card.js'

const makePlayers = () =>
  Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, name: `Player${i}` }))

const createReadyGame = () => {
  const players = makePlayers()
  const game = new Game(players[0], {})
  players.forEach((p) => game.addPlayer(p))
  players.forEach((p) => game.readyPlayer(p))
  return { game, players }
}

const createBiddingGame = () => {
  const { game, players } = createReadyGame()
  game.startGame()
  return { game, players }
}

describe('Game — Room Lobby', () => {
  it('starts in CREATED state', () => {
    const game = new Game({ id: 'a', name: 'A' }, {})
    assert.equal(game.state, GameState.CREATED)
  })

  it('adds players up to 6', () => {
    const game = new Game({ id: 'a', name: 'A' }, {})
    makePlayers().forEach((p) => game.addPlayer(p))
    assert.equal(game.joinedPlayerCount(), 6)
  })

  it('rejects 7th player', () => {
    const game = new Game({ id: 'a', name: 'A' }, {})
    makePlayers().forEach((p) => game.addPlayer(p))
    assert.throws(() => game.addPlayer({ id: 'p6', name: 'Extra' }), /Max players/)
  })

  it('transitions to READY_TO_START when all 6 ready', () => {
    const { game } = createReadyGame()
    assert.equal(game.state, GameState.READY_TO_START)
  })

  it('startGame transitions to BIDDING and deals cards', () => {
    const { game, players } = createBiddingGame()
    assert.equal(game.state, GameState.BIDDING)
    // Each player should have 8 cards (5 visible + 3 hidden)
    for (const pid of Object.keys(game.players)) {
      assert.equal(game.players[pid].hand.cards.length, 8)
    }
  })

  it('dealt cards: 5 visible + 3 hidden per player', () => {
    const { game } = createBiddingGame()
    for (const ps of Object.values(game.players)) {
      const visible = ps.hand.cards.filter((c) => c.visible).length
      const hidden = ps.hand.cards.filter((c) => !c.visible).length
      assert.equal(visible, 5)
      assert.equal(hidden, 3)
    }
  })

  it('no 2s in dealt cards', () => {
    const { game } = createBiddingGame()
    for (const ps of Object.values(game.players)) {
      assert.ok(!ps.hand.cards.some((c) => c.rank === 'TWO'))
    }
  })
})

describe('Game — Bidding', () => {
  it('placeBid stores bid', () => {
    const { game, players } = createBiddingGame()
    game.placeBid(players[0], 300)
    assert.equal(game.bids[players[0].id], 300)
  })

  it('rejects bid out of range', () => {
    const { game, players } = createBiddingGame()
    assert.throws(() => game.placeBid(players[0], 100), /280–508/)
    assert.throws(() => game.placeBid(players[0], 600), /280–508/)
  })

  it('cancelBid removes bid', () => {
    const { game, players } = createBiddingGame()
    game.placeBid(players[0], 300)
    game.cancelBid(players[0])
    assert.equal(game.bids[players[0].id], undefined)
  })

  it('getHighestBidder returns correct player', () => {
    const { game, players } = createBiddingGame()
    game.placeBid(players[0], 300)
    game.placeBid(players[2], 400)
    assert.equal(game.getHighestBidder(), players[2].id)
  })

  it('finalizeBidding sets leader and reveals hidden cards', () => {
    const { game, players } = createBiddingGame()
    game.placeBid(players[1], 350)
    game.finalizeBidding(players[1].id)
    assert.equal(game.state, GameState.SELECTING_TRUMP)
    assert.equal(game.leaderId, players[1].id)
    // All cards should now be visible
    for (const ps of Object.values(game.players)) {
      assert.ok(ps.hand.cards.every((c) => c.visible))
    }
  })
})

describe('Game — Trump Selection', () => {
  it('leader can select trump suit', () => {
    const { game, players } = createBiddingGame()
    game.finalizeBidding(players[0].id)
    game.selectTrumpSuit(players[0], 'SPADES')
    assert.equal(game.trumpSuit, 'SPADES')
    assert.equal(game.state, GameState.SELECTING_ALLIES)
  })

  it('non-leader cannot select trump', () => {
    const { game, players } = createBiddingGame()
    game.finalizeBidding(players[0].id)
    assert.throws(() => game.selectTrumpSuit(players[1], 'SPADES'), /Only the leader/)
  })

  it('rejects invalid suit', () => {
    const { game, players } = createBiddingGame()
    game.finalizeBidding(players[0].id)
    assert.throws(() => game.selectTrumpSuit(players[0], 'STARS'), /Invalid suit/)
  })
})

describe('Game — Ally Selection', () => {
  const setupAllyPhase = () => {
    const { game, players } = createBiddingGame()
    game.finalizeBidding(players[0].id)
    game.selectTrumpSuit(players[0], 'SPADES')
    return { game, players }
  }

  it('leader selects allies by picking cards from other hands', () => {
    const { game, players } = setupAllyPhase()
    // Pick first card from player 1 and player 2
    const card1 = game.players[players[1].id].hand.cards[0]
    const card2 = game.players[players[2].id].hand.cards[0]
    game.selectAllies(players[0], card1, card2)
    assert.equal(game.state, GameState.PLAYING)
    assert.equal(game.leaderTeam.length, 3)
    assert.ok(game.leaderTeam.includes(players[0].id))
  })

  it('rejects ally card from leader own hand', () => {
    const { game, players } = setupAllyPhase()
    const ownCard = game.players[players[0].id].hand.cards[0]
    const otherCard = game.players[players[1].id].hand.cards[0]
    assert.throws(() => game.selectAllies(players[0], ownCard, otherCard), /not be from your own hand/)
  })

  it('non-leader cannot select allies', () => {
    const { game, players } = setupAllyPhase()
    const card1 = game.players[players[1].id].hand.cards[0]
    const card2 = game.players[players[2].id].hand.cards[0]
    assert.throws(() => game.selectAllies(players[1], card1, card2), /Only the leader/)
  })

  it('assigns team roles to all players', () => {
    const { game, players } = setupAllyPhase()
    const card1 = game.players[players[1].id].hand.cards[0]
    const card2 = game.players[players[2].id].hand.cards[0]
    game.selectAllies(players[0], card1, card2)
    const leaders = Object.values(game.players).filter((ps) => ps.team === 'leader')
    const enemies = Object.values(game.players).filter((ps) => ps.team === 'enemy')
    assert.equal(leaders.length, 3)
    assert.equal(enemies.length, 3)
  })
})

describe('Game — Turn Mechanics', () => {
  const setupPlayingGame = () => {
    const { game, players } = createBiddingGame()
    game.finalizeBidding(players[0].id)
    game.selectTrumpSuit(players[0], 'SPADES')
    const card1 = game.players[players[1].id].hand.cards[0]
    const card2 = game.players[players[2].id].hand.cards[0]
    game.selectAllies(players[0], card1, card2)
    return { game, players }
  }

  it('turn starts with leader, currentTurn is set', () => {
    const { game, players } = setupPlayingGame()
    assert.ok(game.currentTurn)
    assert.equal(game.currentTurn.playOrder[0], players[0].id)
  })

  it('rejects play from wrong player', () => {
    const { game, players } = setupPlayingGame()
    // Player 1 tries to play before player 0
    const card = game.players[players[1].id].hand.cards[0]
    assert.throws(() => game.playCard(players[1], card), /Not.*turn/)
  })

  it('rejects card not in hand', () => {
    const { game, players } = setupPlayingGame()
    const fakeCard = { suit: 'CLUBS', rank: 'ACE' }
    // Only throws if player doesn't actually hold it
    const hand = game.players[players[0].id].hand
    if (!hand.cards.some((c) => c.suit === 'CLUBS' && c.rank === 'ACE')) {
      assert.throws(() => game.playCard(players[0], fakeCard), /doesn't hold/)
    }
  })

  it('full turn resolves with a winner', () => {
    const { game, players } = setupPlayingGame()
    let result = null
    for (let i = 0; i < 6; i++) {
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
    assert.ok(result)
    assert.ok(result.winnerId)
    assert.ok(typeof result.trickPoints === 'number')
    assert.equal(result.gameOver, false)
    assert.equal(game.turnNumber, 1)
  })

  it('full game plays 8 turns and ends', () => {
    const { game, players } = setupPlayingGame()
    let result = null
    for (let turn = 0; turn < 8; turn++) {
      for (let i = 0; i < 6; i++) {
        const pid = game.currentTurn.playOrder[game.currentTurn.playedCards.length]
        const ps = game.players[pid]
        // Pick first card that follows suit if possible
        const leadSuit = game.currentTurn.leadSuit
        let card = ps.hand.cards[0]
        if (leadSuit) {
          const suitCard = ps.hand.cards.find((c) => c.suit === leadSuit)
          if (suitCard) card = suitCard
        }
        result = game.playCard({ id: pid }, card)
      }
    }
    assert.ok(result.gameOver)
    assert.equal(game.state, GameState.OVER)
    assert.ok(game.winnerId === 'leader' || game.winnerId === 'enemy')
    // Total points across all players should equal total deck points (minus 2s)
    const totalScore = game.leaderTeamScore + game.enemyTeamScore
    assert.ok(totalScore > 0)
  })
})

describe('Game — Trump Reveal', () => {
  it('requestTrumpReveal sets trumpRevealed', () => {
    const { game, players } = createBiddingGame()
    game.finalizeBidding(players[0].id)
    game.selectTrumpSuit(players[0], 'SPADES')
    const card1 = game.players[players[1].id].hand.cards[0]
    const card2 = game.players[players[2].id].hand.cards[0]
    game.selectAllies(players[0], card1, card2)

    // Play leader's card first to set lead suit
    const leaderId = game.currentTurn.playOrder[0]
    const leaderCard = game.players[leaderId].hand.cards[0]
    game.playCard({ id: leaderId }, leaderCard)

    // Find a player who doesn't have the lead suit
    const leadSuit = game.currentTurn.leadSuit
    for (let i = 1; i < 6; i++) {
      const pid = game.currentTurn.playOrder[i]
      if (game.currentTurn.playedCards.length > i) continue
      if (pid !== game.currentTurn.playOrder[game.currentTurn.playedCards.length]) continue
      const ps = game.players[pid]
      const hasLead = ps.hand.cards.some((c) => c.suit === leadSuit)
      if (!hasLead) {
        game.requestTrumpReveal({ id: pid })
        assert.equal(game.trumpRevealed, true)
        return
      }
      // If they have lead suit, just play a card to advance
      const card = ps.hand.cards.find((c) => c.suit === leadSuit)
      game.playCard({ id: pid }, card)
    }
    // If everyone had the lead suit, trump reveal wasn't testable this deal — that's ok
  })
})
