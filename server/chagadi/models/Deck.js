import Card, { Suit, Rank } from './Card.js'

// TODO: Investigate if we need all the methods here (simplify).
export class Hand {
  constructor(cards = []) {
    this.cards = [...cards]
  }

  addCard(card) {
    this.cards.push(card)
  }

  removeCard(card) {
    const idx = this.cards.findIndex((c) => c.matches(card))
    if (idx === -1) return false
    this.cards.splice(idx, 1)
    return true
  }

  hasCard(card) {
    return this.cards.some((c) => c.matches(card))
  }

  hasSuit(suit) {
    return this.cards.some((c) => c.suit === suit)
  }

  merge(other) {
    this.cards.push(...other.cards)
    return this
  }

  sorted() {
    const suitOrder = Object.keys(Suit)
    return [...this.cards].sort((a, b) => {
      const sd = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit)
      return sd !== 0 ? sd : a.trumpOrder - b.trumpOrder
    })
  }

  get size() {
    return this.cards.length
  }

  totalPoints() {
    return this.cards.reduce((sum, c) => sum + c.points, 0)
  }
}

// TODO: Investigate if we need all the methods here (simplify).
export default class Deck {
  constructor(cards = []) {
    this.cards = [...cards]
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
    }
    return this
  }

  deal(nHands, cardsPerHand) {
    const total = nHands * cardsPerHand
    if (total > this.cards.length) {
      throw new Error(`Not enough cards: need ${total}, have ${this.cards.length}`)
    }
    const hands = Array.from({ length: nHands }, () => new Hand())
    for (let i = 0; i < total; i++) {
      hands[i % nHands].addCard(this.cards.shift())
    }
    return hands
  }

  filter(predicate) {
    return new Deck(this.cards.filter(predicate))
  }

  get size() {
    return this.cards.length
  }

  static standard() {
    const cards = []
    for (const suit of Object.values(Suit)) {
      for (const rank of Object.values(Rank)) {
        cards.push(new Card(suit, rank))
      }
    }
    return new Deck(cards)
  }
}
