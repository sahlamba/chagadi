import React from 'react'
import { Flex } from '@chakra-ui/react'

import { useGameContext } from '../../context/GameContext'

import GameDetails from './GameDetails'
import GameCreatedUI from './GameCreatedUI'
import GameReadyToStartUI from './GameReadyToStartUI'
import GameBiddingUI from './GameBiddingUI'
import GameSelectTrumpUI from './GameSelectTrumpUI'
import GameSelectAlliesUI from './GameSelectAlliesUI'
import GamePlayUI from './GamePlayUI'

const GameContent = () => {
  const { game, loadingGame } = useGameContext()

  if (!loadingGame.status && !game) {
    return (
      <Flex my={8} alignItems="center" justifyContent="center">
        No game found!
      </Flex>
    )
  }

  const getGameStateUI = () => {
    if (!game) return null
    switch (game.state) {
      case 'CREATED':
        return <GameCreatedUI />
      case 'READY_TO_START':
        return <GameReadyToStartUI />
      case 'BIDDING':
        return <GameBiddingUI />
      case 'SELECTING_TRUMP':
        return <GameSelectTrumpUI />
      case 'SELECTING_ALLIES':
        return <GameSelectAlliesUI />
      case 'PLAYING':
      case 'OVER':
        return <GamePlayUI />
      default:
        return null
    }
  }

  return (
    <React.Fragment>
      <GameDetails />
      {getGameStateUI()}
    </React.Fragment>
  )
}

export default GameContent
