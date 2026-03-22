import Chagadi from '../chagadi/index.js'

export const getPlayerGames = (req, res, next) => {
  try {
    const { playerId } = req.query
    if (!playerId) {
      throw new Error('Missing player ID, API usage: ?playerId=<playerId>')
    }
    const playerGameCodeMappings = Chagadi.getPlayerJoinedGames(playerId)
    res.json({ ok: true, playerGameCodeMappings })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
