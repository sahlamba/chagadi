import loki from 'lokijs'

export default class ChagadiDatabase {
  constructor() {
    this.db = new loki('chagadi.db', { adapter: new loki.LokiMemoryAdapter() })
    this.games = this.db.addCollection('games', { unique: 'code', autoupdate: true })
    this.playerGames = this.db.addCollection('player_games', { unique: 'id', autoupdate: true })
  }

  insertGame(game) { this.games.insert(this.jsonify(game)) }
  getGameById(code) { return this.games.findOne({ code }) }
  updateGame(game) { this.games.update(this.jsonify(game)) }
  deleteGame(code) { this.games.findAndRemove({ code }) }

  insertPlayerGame(player, gameCode) {
    const id = `${player.id}:${gameCode}`
    this.playerGames.insert(this.jsonify({ id, playerId: player.id, gameCode }))
  }

  getPlayerGamesByPlayerId(playerId) {
    return this.playerGames.find({ playerId })
  }

  jsonify(obj) { return JSON.parse(JSON.stringify(obj)) }
}
