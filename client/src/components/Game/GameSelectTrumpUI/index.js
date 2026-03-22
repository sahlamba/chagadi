import React from 'react'
import { Button, Flex, HStack, Text } from '@chakra-ui/react'

import { useGameContext } from '../../../context/GameContext'
import HandDisplay from '../HandDisplay'

const suits = [
  { name: 'CLUBS', symbol: '♣', color: 'gray.100' },
  { name: 'HEARTS', symbol: '♥', color: 'red.400' },
  { name: 'SPADES', symbol: '♠', color: 'gray.100' },
  { name: 'DIAMONDS', symbol: '♦', color: 'red.400' },
]

const GameSelectTrumpUI = () => {
  const { getMyHand, isLeader, selectTrump, actionInProgress } = useGameContext()

  return (
    <Flex direction="column" align="center" gap={6} mt={4}>
      <HandDisplay cards={getMyHand()} label="Your Cards" />

      {isLeader() ? (
        <Flex direction="column" align="center" gap={3}>
          <Text fontWeight="bold" color="yellow.300">You are the leader — pick a trump suit</Text>
          <HStack spacing={3}>
            {suits.map((s) => (
              <Button
                key={s.name}
                size="lg"
                fontSize="2rem"
                variant="outline"
                borderColor="gray.500"
                color={s.color}
                _hover={{ bg: 'gray.700', borderColor: 'yellow.400' }}
                isLoading={actionInProgress}
                onClick={() => selectTrump(s.name)}
              >
                {s.symbol}
              </Button>
            ))}
          </HStack>
        </Flex>
      ) : (
        <Text color="gray.400">Waiting for the leader to pick a trump suit...</Text>
      )}
    </Flex>
  )
}

export default GameSelectTrumpUI
