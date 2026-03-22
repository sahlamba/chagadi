import React from 'react'
import { Button, Flex } from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'

import { useGameContext } from '../../../context/GameContext'

const PlayerNotJoined = () => {
  const { joinGame, joiningGame } = useGameContext()

  const joinGameOnCLick = () => joinGame()

  return (
    <Flex alignItems="center" justifyContent="center">
      <Button
        colorScheme="yellow"
        variant="solid"
        rightIcon={<CheckIcon />}
        onClick={joinGameOnCLick}
        isLoading={joiningGame}>
        Join this game
      </Button>
    </Flex>
  )
}

export default PlayerNotJoined
