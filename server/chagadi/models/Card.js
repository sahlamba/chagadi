export const Suit = {
  CLUBS:    { name: 'CLUBS',    symbol: '♣' },
  HEARTS:   { name: 'HEARTS',   symbol: '♥' },
  SPADES:   { name: 'SPADES',   symbol: '♠' },
  DIAMONDS: { name: 'DIAMONDS', symbol: '♦' },
}

export const getSuit = (name) => {
  const suit = Suit[name]
  if (!suit) throw new Error(`Unknown suit: ${name}`)
  return suit
}

// Points: Queen=50, rest=face value. TrumpOrder: lower = stronger (Ace=1 is highest).
export const Rank = {
  ACE:   { name: 'ACE',   symbol: 'A',  value: 1,  points: 1,  trumpOrder: 1 },
  TWO:   { name: 'TWO',   symbol: '2',  value: 2,  points: 2,  trumpOrder: 13 },
  THREE: { name: 'THREE', symbol: '3',  value: 3,  points: 3,  trumpOrder: 12 },
  FOUR:  { name: 'FOUR',  symbol: '4',  value: 4,  points: 4,  trumpOrder: 11 },
  FIVE:  { name: 'FIVE',  symbol: '5',  value: 5,  points: 5,  trumpOrder: 10 },
  SIX:   { name: 'SIX',   symbol: '6',  value: 6,  points: 6,  trumpOrder: 9 },
  SEVEN: { name: 'SEVEN', symbol: '7',  value: 7,  points: 7,  trumpOrder: 8 },
  EIGHT: { name: 'EIGHT', symbol: '8',  value: 8,  points: 8,  trumpOrder: 7 },
  NINE:  { name: 'NINE',  symbol: '9',  value: 9,  points: 9,  trumpOrder: 6 },
  TEN:   { name: 'TEN',   symbol: '10', value: 10, points: 10, trumpOrder: 5 },
  JACK:  { name: 'JACK',  symbol: 'J',  value: 11, points: 11, trumpOrder: 4 },
  QUEEN: { name: 'QUEEN', symbol: 'Q',  value: 12, points: 50, trumpOrder: 3 },
  KING:  { name: 'KING',  symbol: 'K',  value: 13, points: 13, trumpOrder: 2 },
}

export const getRank = (name) => {
  const rank = Rank[name]
  if (!rank) throw new Error(`Unknown rank: ${name}`)
  return rank
}

export const cardMeta = {
  suits: Object.fromEntries(Object.entries(Suit).map(([k, v]) => [k, { symbol: v.symbol, order: Object.keys(Suit).indexOf(k) }])),
  ranks: Object.fromEntries(Object.entries(Rank).map(([k, v]) => [k, { symbol: v.symbol, trumpOrder: v.trumpOrder, points: v.points }])),
}

export default class Card {
  constructor(suit, rank, visible = true) {
    this.suit = suit.name   // store name string for serialization
    this.rank = rank.name
    this.visible = visible
  }

  get suitObj() { return getSuit(this.suit) }
  get rankObj() { return getRank(this.rank) }
  get points() { return this.rankObj.points }
  get trumpOrder() { return this.rankObj.trumpOrder }
  get symbol() { return `${this.rankObj.symbol}${this.suitObj.symbol}` }
  get id() { return `${this.rank}_${this.suit}` }

  matches(other) {
    return this.suit === other.suit && this.rank === other.rank
  }

  static from(json) {
    const card = Object.create(Card.prototype)
    return Object.assign(card, json)
  }
}
