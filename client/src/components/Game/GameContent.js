import React from 'react'
import { Flex } from '@chakra-ui/react'

import { useGameContext } from '../../context/GameContext'

import GameDetails from './GameDetails'
import GameCreatedUI from './GameCreatedUI'
import GameReadyToStartUI from './GameReadyToStartUI'
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
        return <Flex justify="center" mt={8}>Bidding phase — UI coming in 8b</Flex>
      case 'SELECTING_TRUMP':
        return <Flex justify="center" mt={8}>Trump selection — UI coming in 8c</Flex>
      case 'SELECTING_ALLIES':
        return <Flex justify="center" mt={8}>Ally selection — UI coming in 8c</Flex>
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
