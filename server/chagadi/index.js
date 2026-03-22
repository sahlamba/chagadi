import ChagadiDatabase from './db.js'
import Game from './models/Game.js'

export default class Chagadi {
  static db = new ChagadiDatabase()

  static newGame(player, settings) {
    const game = new Game(player, settings)
    this.db.insertGame(game)
    return game
  }

  static getGame(gameCode) {
    const json = this.db.getGameById(gameCode)
    return json ? Game.from(json) : null
  }

  static getGameOrThrow(gameCode) {
    const game = this.getGame(gameCode)
    if (!game) throw new Error(`Game not found: ${gameCode}`)
    return game
  }

  static joinGame(gameCode, player) {
    const game = this.getGameOrThrow(gameCode)
    game.addPlayer(player)
    this.db.updateGame(game)
    this.db.insertPlayerGame(player, gameCode)
  }

  static getPlayerJoinedGames(playerId) {
    return this.db.getPlayerGamesByPlayerId(playerId)
  }

  static readyPlayer(gameCode, player) {
    const game = this.getGameOrThrow(gameCode)
    game.readyPlayer(player)
    this.db.updateGame(game)
  }

  static startGame(gameCode) {
    const game = this.getGameOrThrow(gameCode)
    game.startGame()
    this.db.updateGame(game)
  }

  static placeBid(gameCode, player, amount) {
    const game = this.getGameOrThrow(gameCode)
    game.placeBid(player, amount)
    this.db.updateGame(game)
  }

  static cancelBid(gameCode, player) {
    const game = this.getGameOrThrow(gameCode)
    game.cancelBid(player)
    this.db.updateGame(game)
  }

  static finalizeBidding(gameCode, leaderId) {
    const game = this.getGameOrThrow(gameCode)
    game.finalizeBidding(leaderId)
    this.db.updateGame(game)
  }

  static selectTrumpSuit(gameCode, player, suitName) {
    const game = this.getGameOrThrow(gameCode)
    game.selectTrumpSuit(player, suitName)
    this.db.updateGame(game)
  }

  static selectAllies(gameCode, player, card1, card2) {
    const game = this.getGameOrThrow(gameCode)
    game.selectAllies(player, card1, card2)
    this.db.updateGame(game)
  }

  static playCard(gameCode, player, card) {
    const game = this.getGameOrThrow(gameCode)
    const result = game.playCard(player, card)
    this.db.updateGame(game)
    return result
  }

  static requestTrumpReveal(gameCode, player) {
    const game = this.getGameOrThrow(gameCode)
    game.requestTrumpReveal(player)
    this.db.updateGame(game)
  }
}
