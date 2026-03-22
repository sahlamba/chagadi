import React from 'react'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'

import { useGameContext } from '../../../context/GameContext'
import TableLayout from '../TableLayout'

const suits = [
  { name: 'CLUBS', symbol: '♣', color: 'gray.100' },
  { name: 'HEARTS', symbol: '♥', color: 'red.400' },
  { name: 'SPADES', symbol: '♠', color: 'gray.100' },
  { name: 'DIAMONDS', symbol: '♦', color: 'red.400' },
]

const TrumpControls = () => {
  const { isLeader, selectTrump, actionInProgress } = useGameContext()

  if (!isLeader()) {
    return <Text color="gray.400">Waiting for the leader to pick a trump suit...</Text>
  }

  return (
    <VStack spacing={3}>
      <Text fontWeight="bold" color="yellow.300">Pick a trump suit</Text>
      <HStack spacing={3}>
        {suits.map(s => (
          <Button
            key={s.name} size="lg" fontSize="2rem"
            variant="outline" borderColor="gray.500" color={s.color}
            _hover={{ bg: 'gray.700', borderColor: 'yellow.400' }}
            isLoading={actionInProgress}
            onClick={() => selectTrump(s.name)}
          >
            {s.symbol}
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
