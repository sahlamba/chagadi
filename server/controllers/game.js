import Chagadi from '../chagadi/index.js'
import { filterGameForPlayer } from '../socketio/listeners.js'
import {
  validateGameCode,
  validatePlayer,
  validateSettings,
} from '../utils/validation.js'

export const getGame = (req, res, next) => {
  try {
    const { code, playerId } = req.query
    validateGameCode(code)
    const game = playerId ? filterGameForPlayer(code, playerId) : Chagadi.getGame(code)
    res.json({ ok: true, game })
  } catch (error) {
    console.error(error)
    next(error)
  }
}

export const createGame = (req, res, next) => {
  try {
    const { player, settings } = req.body
    validatePlayer(player)
    validateSettings(settings)
    const game = Chagadi.newGame(player, settings)
    res.json({ ok: true, game })
  } catch (error) {
    console.error(error)
    next(error)
  }
}
