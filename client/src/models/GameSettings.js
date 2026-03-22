export default class GameSettings {
  maxPlayers

  constructor(maxPlayers) {
    this.maxPlayers = maxPlayers
  }

  static from(json) {
    return Object.assign(new GameSettings(), json)
  }
}
