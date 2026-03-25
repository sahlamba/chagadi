import React from 'react'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'

import { useGameContext } from '../../../context/GameContext'
import TableLayout from '../TableLayout'

import { suitSymbol } from '../CardDisplay'

const suitColors = { HEARTS: 'red.400', DIAMONDS: 'red.400', CLUBS: 'gray.100', SPADES: 'gray.100' }
const suitNames = ['CLUBS', 'HEARTS', 'SPADES', 'DIAMONDS']

const TrumpControls = () => {
  const { isLeader, selectTrump, actionInProgress, game } = useGameContext()

  if (!isLeader()) {
    return <Text color="gray.400">Waiting for <Text as="span" fontWeight="bold" color="yellow.300">{game.players[game.leaderId]?.player?.name || 'the leader'}</Text> to pick a trump suit...</Text>
  }

  return (
    <VStack spacing={3}>
      <Text fontWeight="bold" color="yellow.300">Pick a trump suit</Text>
      <HStack spacing={3}>
        {suitNames.map(name => (
          <Button
            key={name} size="lg" fontSize="2rem"
            variant="outline" borderColor="gray.500" color={suitColors[name]}
            _hover={{ bg: 'gray.700', borderColor: 'yellow.400' }}
            isLoading={actionInProgress}
            onClick={() => selectTrump(name)}
          >
            {suitSymbol(name, game?.cardMeta)}
          </Button>
        ))}
      </HStack>
    </VStack>
  )
}

const GameSelectTrumpUI = () => (
  <TableLayout>
    <TrumpControls />
  </TableLayout>
)

export default GameSelectTrumpUI
