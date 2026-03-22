import React from 'react'
import { Flex, Text } from '@chakra-ui/react'

import { useGameContext } from '../../../context/GameContext'

import StartGameButton from './StartGameButton'

const GameReadyToStartUI = () => {
  const { isPlayerAdmin, game } = useGameContext()

  return (
    <Flex alignItems="center" justifyContent="center">
      {isPlayerAdmin() ? (
        <StartGameButton />
      ) : (
        <Text>Waiting for <Text as="span" fontWeight="bold" color="yellow.300">{game?.admin?.name || 'admin'}</Text> to start game...</Text>
      )}
    </Flex>
  )
}

export default GameReadyToStartUI
