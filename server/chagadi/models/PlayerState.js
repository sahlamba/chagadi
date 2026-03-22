import { Hand } from './Deck.js'

export default class PlayerState {
  constructor(player) {
    this.player = player
    this.isReady = false
    this.hand = new Hand()
    this.wonTricks = []   // array of { cards: Card[], points: number }
    this.team = null       // 'leader' | 'enemy' | null (assigned after ally selection)
  }

  static from(json) {
    const ps = Object.create(PlayerState.prototype)
    return Object.assign(ps, json)
  }

  setIsReady() {
    this.isReady = true
  }

  get totalScore() {
    return this.wonTricks.reduce((sum, t) => sum + t.points, 0)
  }

  addWonTrick(cards) {
    const points = cards.reduce((sum, c) => sum + c.points, 0)
    this.wonTricks.push({ cards, points })
  }
}
