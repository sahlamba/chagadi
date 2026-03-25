import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useToast } from '@chakra-ui/react'

import { API_BASE_URL } from '../constants'
import { usePlayerContext } from './PlayerContext'
import { getGameById } from '../utils/apiClient'
import { notify } from '../utils/ui'

const GameContext = createContext(null)

export const GameProvider = ({ children }) => {
  const { player } = usePlayerContext()

  const [socket, setSocket] = useState(null)
  const [game, setGame] = useState(null)
  const [loadingGame, setLoadingGame] = useState({ status: true, message: '' })
  const [joiningGame, setJoiningGame] = useState(false)
  const [readyingPlayer, setReadyingPlayer] = useState(false)
  const [startingGame, setStartingGame] = useState(false)
  const [actionInProgress, setActionInProgress] = useState(false)

  const toast = useToast()

  const getAndSetGame = async (gameCode) => {
    setLoadingGame({ status: true, message: 'Loading game' })
    try {
      setGame(await getGameById(gameCode, player?.id))
    } catch (error) {
      notify(toast, { title: error, status: 'error' })
    }
    setLoadingGame({ status: false, message: '' })
  }

  // ── Emit helper ──

  const emit = (event, data, { loading, setLoading } = {}) => {
    if (!socket || !game) return
    if (setLoading) setLoading(true)
    socket.emit(event, { gameCode: game.code, ...data }, (err) => {
      if (setLoading) setLoading(false)
      if (err) notify(toast, { title: err.message, status: 'error' })
    })
  }

  // ── Lobby actions ──

  const connectPlayer = (gameCode) => {
    if (!socket || !gameCode) return
    setLoadingGame({ status: true, message: 'Connecting player' })
    socket.emit('connect_player', { gameCode, player }, (err) => {
      setLoadingGame({ status: false, message: '' })
      if (err) {
        notify(toast, { title: err.message, status: 'error' })
        return
      }
      getAndSetGame(gameCode)
    })
  }

  const disconnectPlayer = (gameCode) => {
    if (socket && gameCode) socket.emit('disconnect_player', { gameCode, player })
  }

  const joinGame = () => emit('join_game', { player }, { setLoading: setJoiningGame })
  const readyPlayer = () => emit('ready_player', { player }, { setLoading: setReadyingPlayer })
  const startGame = () => emit('start_game', {}, { setLoading: setStartingGame })

  // ── Chagadi actions ──

  const placeBid = (amount) => emit('place_bid', { player, amount }, { setLoading: setActionInProgress })
  const cancelBid = () => emit('cancel_bid', { player }, { setLoading: setActionInProgress })
  const finalizeBidding = (leaderId) => emit('finalize_bidding', { leaderId }, { setLoading: setActionInProgress })
  const selectTrump = (suitName) => emit('select_trump', { player, suitName }, { setLoading: setActionInProgress })
  const selectAllies = (...cards) => emit('select_allies', { player, allyCards: cards }, { setLoading: setActionInProgress })
  const playCard = (card) => emit('play_card', { player, card }, { setLoading: setActionInProgress })
  const requestTrumpReveal = () => emit('request_trump_reveal', { player }, { setLoading: setActionInProgress })

  // ── Helpers ──

  const getPlayerState = () => player && game?.players?.[player.id] || null
  const hasPlayerJoinedGame = () => !!getPlayerState()
  const isPlayerReady = () => !!getPlayerState()?.isReady
  const isPlayerAdmin = () => player && game?.admin?.id === player.id
  const isLeader = () => game?.leaderId === player?.id
  const getMyHand = () => getPlayerState()?.hand?.cards || []
  const getMyTeam = () => getPlayerState()?.team || null
  const getMyBid = () => game?.bids?.[player?.id] ?? null
  const getCurrentTurn = () => game?.currentTurn || null
  const isMyTurn = () => {
    const turn = getCurrentTurn()
    return turn && turn.playOrder[turn.playedCards.length] === player?.id
  }
  const isGameOver = () => game?.state === 'OVER'

  // ── Socket listeners ──

  useEffect(() => {
    const s = io(API_BASE_URL)
    s.on('connect', () => setSocket(s))
    s.on('disconnect', () => setSocket(null))
    s.on('game_updated', ({ gameState }) => setGame(gameState))
    // Keep legacy listeners for lobby (initial join/ready before game_updated kicks in)
    s.on('player_joined_game', ({ gameState }) => setGame(gameState))
    s.on('player_ready_in_game', ({ gameState }) => setGame(gameState))
    s.on('game_started', ({ gameState }) => setGame(gameState))
    return () => s.disconnect()
  }, [])

  return (
    <GameContext.Provider
      value={{
        socket, game, player, loadingGame, joiningGame, readyingPlayer, startingGame, actionInProgress,
        connectPlayer, disconnectPlayer, joinGame, readyPlayer, startGame,
        placeBid, cancelBid, finalizeBidding, selectTrump, selectAllies, playCard, requestTrumpReveal,
        hasPlayerJoinedGame, isPlayerReady, isPlayerAdmin, isLeader,
        getMyHand, getMyTeam, getMyBid, getCurrentTurn, isMyTurn, isGameOver,
        getPlayerState, notify,
      }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGameContext = () => useContext(GameContext)
