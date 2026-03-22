import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Card, { Suit, Rank } from '../models/Card.js'
import Deck, { Hand } from '../models/Deck.js'

describe('Hand', () => {
  it('addCard and size', () => {
    const h = new Hand()
    assert.equal(h.size, 0)
    h.addCard(new Card(Suit.CLUBS, Rank.ACE))
    assert.equal(h.size, 1)
  })

  it('removeCard returns true and removes, false if missing', () => {
    const h = new Hand()
    const card = new Card(Suit.HEARTS, Rank.KING)
    h.addCard(card)
    assert.equal(h.removeCard(new Card(Suit.HEARTS, Rank.KING)), true)
    assert.equal(h.size, 0)
    assert.equal(h.removeCard(new Card(Suit.HEARTS, Rank.KING)), false)
  })

  it('hasCard and hasSuit', () => {
    const h = new Hand()
    h.addCard(new Card(Suit.SPADES, Rank.TEN))
    assert.ok(h.hasCard(new Card(Suit.SPADES, Rank.TEN)))
    assert.ok(!h.hasCard(new Card(Suit.SPADES, Rank.NINE)))
    assert.ok(h.hasSuit('SPADES'))
    assert.ok(!h.hasSuit('HEARTS'))
  })

  it('merge combines two hands', () => {
    const a = new Hand([new Card(Suit.CLUBS, Rank.THREE)])
    const b = new Hand([new Card(Suit.HEARTS, Rank.FOUR)])
    a.merge(b)
    assert.equal(a.size, 2)
  })

  it('totalPoints sums card points', () => {
    const h = new Hand([
      new Card(Suit.CLUBS, Rank.QUEEN),  // 50
      new Card(Suit.HEARTS, Rank.TEN),   // 10
    ])
    assert.equal(h.totalPoints(), 60)
  })

  it('sorted orders by suit then trump order', () => {
    const h = new Hand([
      new Card(Suit.HEARTS, Rank.KING),   // HEARTS, trumpOrder 2
      new Card(Suit.CLUBS, Rank.THREE),   // CLUBS, trumpOrder 12
      new Card(Suit.CLUBS, Rank.ACE),     // CLUBS, trumpOrder 1
      new Card(Suit.HEARTS, Rank.ACE),    // HEARTS, trumpOrder 1
    ])
    const sorted = h.sorted()
    // CLUBS first (index 0 in Suit), then HEARTS
    assert.equal(sorted[0].symbol, 'A♣')
    assert.equal(sorted[1].symbol, '3♣')
    assert.equal(sorted[2].symbol, 'A♥')
    assert.equal(sorted[3].symbol, 'K♥')
  })
})

describe('Deck', () => {
  it('standard deck has 52 cards', () => {
    assert.equal(Deck.standard().size, 52)
  })

  it('standard deck has 13 cards per suit', () => {
    const deck = Deck.standard()
    for (const suit of Object.values(Suit)) {
      const count = deck.cards.filter((c) => c.suit === suit.name).length
      assert.equal(count, 13)
    }
  })

  it('shuffle changes card order', () => {
    const a = Deck.standard()
    const b = Deck.standard().shuffle()
    // Extremely unlikely all 52 positions match after shuffle
    const same = a.cards.every((c, i) => c.id === b.cards[i].id)
    assert.ok(!same)
  })

  it('filter removes cards by predicate', () => {
    const deck = Deck.standard().filter((c) => c.rank !== 'TWO')
    assert.equal(deck.size, 48)
    assert.ok(!deck.cards.some((c) => c.rank === 'TWO'))
  })

  it('deal creates correct number of hands with correct sizes', () => {
    const deck = Deck.standard().filter((c) => c.rank !== 'TWO') // 48 cards
    const hands = deck.deal(6, 5)
    assert.equal(hands.length, 6)
    hands.forEach((h) => assert.equal(h.size, 5))
    assert.equal(deck.size, 18) // 48 - 30 dealt
  })

  it('deal throws if not enough cards', () => {
    const deck = new Deck([new Card(Suit.CLUBS, Rank.ACE)])
    assert.throws(() => deck.deal(2, 3), /Not enough cards/)
  })

  it('deal distributes round-robin', () => {
    const deck = Deck.standard()
    const hands = deck.deal(2, 3) // 6 cards dealt to 2 hands
    // Each hand gets 3 cards
    assert.equal(hands[0].size, 3)
    assert.equal(hands[1].size, 3)
  })
})
