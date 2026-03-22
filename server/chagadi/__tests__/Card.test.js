import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Card, { Suit, Rank, getRank, getSuit } from '../models/Card.js'

describe('Rank', () => {
  it('Ace has highest trump order (1), Two has lowest (13)', () => {
    assert.equal(Rank.ACE.trumpOrder, 1)
    assert.equal(Rank.TWO.trumpOrder, 13)
  })

  it('Queen is worth 50 points', () => {
    assert.equal(Rank.QUEEN.points, 50)
  })

  it('face values are correct', () => {
    assert.equal(Rank.ACE.value, 1)
    assert.equal(Rank.TEN.value, 10)
    assert.equal(Rank.KING.value, 13)
  })

  it('getRank throws on unknown rank', () => {
    assert.throws(() => getRank('JOKER'), /Unknown rank/)
  })
})

describe('Suit', () => {
  it('has 4 suits with name and symbol', () => {
    assert.equal(Object.keys(Suit).length, 4)
    assert.equal(Suit.CLUBS.name, 'CLUBS')
    assert.equal(Suit.CLUBS.symbol, '♣')
    assert.equal(Suit.HEARTS.symbol, '♥')
    assert.equal(Suit.SPADES.symbol, '♠')
    assert.equal(Suit.DIAMONDS.symbol, '♦')
  })

  it('getSuit looks up by name string', () => {
    assert.equal(getSuit('HEARTS'), Suit.HEARTS)
  })

  it('getSuit throws on unknown suit', () => {
    assert.throws(() => getSuit('STARS'), /Unknown suit/)
  })
})

describe('Card', () => {
  it('stores suit and rank as name strings', () => {
    const card = new Card(Suit.SPADES, Rank.ACE)
    assert.equal(card.suit, 'SPADES')
    assert.equal(card.rank, 'ACE')
  })

  it('computes points via rankObj', () => {
    assert.equal(new Card(Suit.HEARTS, Rank.QUEEN).points, 50)
    assert.equal(new Card(Suit.CLUBS, Rank.SEVEN).points, 7)
  })

  it('computes trump order via rankObj', () => {
    assert.equal(new Card(Suit.DIAMONDS, Rank.ACE).trumpOrder, 1)
    assert.equal(new Card(Suit.DIAMONDS, Rank.KING).trumpOrder, 2)
  })

  it('generates symbol string', () => {
    assert.equal(new Card(Suit.SPADES, Rank.ACE).symbol, 'A♠')
    assert.equal(new Card(Suit.HEARTS, Rank.QUEEN).symbol, 'Q♥')
    assert.equal(new Card(Suit.DIAMONDS, Rank.TEN).symbol, '10♦')
  })

  it('generates unique id', () => {
    assert.equal(new Card(Suit.CLUBS, Rank.JACK).id, 'JACK_CLUBS')
  })

  it('matches cards with same suit and rank', () => {
    const a = new Card(Suit.HEARTS, Rank.FIVE)
    const b = new Card(Suit.HEARTS, Rank.FIVE)
    const c = new Card(Suit.HEARTS, Rank.SIX)
    assert.ok(a.matches(b))
    assert.ok(!a.matches(c))
  })

  it('defaults to visible', () => {
    assert.equal(new Card(Suit.CLUBS, Rank.ACE).visible, true)
  })

  it('can be created hidden', () => {
    assert.equal(new Card(Suit.CLUBS, Rank.ACE, false).visible, false)
  })

  it('Card.from restores getters from JSON', () => {
    const card = new Card(Suit.SPADES, Rank.QUEEN)
    const json = JSON.parse(JSON.stringify(card))
    const restored = Card.from(json)
    assert.equal(restored.points, 50)
    assert.equal(restored.symbol, 'Q♠')
    assert.ok(restored.matches(card))
  })
})
