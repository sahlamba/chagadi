import React, { useState } from 'react'
import { Button, Flex, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react'

import { useGameContext } from '../../../context/GameContext'
import HandDisplay from '../HandDisplay'
import CardDisplay from '../CardDisplay'

const suitSymbols = { CLUBS: '♣', HEARTS: '♥', SPADES: '♠', DIAMONDS: '♦' }
const suitColors = { HEARTS: 'red.400', DIAMONDS: 'red.400', CLUBS: 'gray.100', SPADES: 'gray.100' }

const suits = ['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS']
const ranks = ['ACE', 'KING', 'QUEEN', 'JACK', 'TEN', 'NINE', 'EIGHT', 'SEVEN', 'SIX', 'FIVE', 'FOUR', 'THREE']

const allCards = suits.flatMap(suit => ranks.map(rank => ({ suit, rank, visible: true })))

const GameSelectAlliesUI = () => {
  const { game, getMyHand, isLeader, selectAllies, actionInProgress } = useGameContext()
  const [picks, setPicks] = useState([])

  const myCards = getMyHand()
  const myCardIds = new Set(myCards.map(c => `${c.rank}_${c.suit}`))
  const trumpSuit = game?.trumpSuit

  const isSelected = (card) => picks.some(p => p.suit === card.suit && p.rank === card.rank)

  const toggleCard = (card) => {
    const id = `${card.rank}_${card.suit}`
    if (myCardIds.has(id)) return
    if (isSelected(card)) {
      setPicks(picks.filter(p => !(p.suit === card.suit && p.rank === card.rank)))
    } else if (picks.length < 2) {
      setPicks([...picks, { suit: card.suit, rank: card.rank }])
    }
  }

  return (
    <Flex direction="column" align="center" gap={6} mt={4}>
      <HandDisplay cards={myCards} label="Your Cards" />

      {isLeader() ? (
        <VStack spacing={4}>
          <Text fontWeight="bold" color="yellow.300">
            Tap 2 cards to call as allies (your cards are disabled)
          </Text>
          {trumpSuit && (
            <Text fontSize="sm" color="gray.400">
              Your trump: <Text as="span" fontSize="lg" color={suitColors[trumpSuit] || 'gray.100'}>{suitSymbols[trumpSuit]}</Text>
            </Text>
          )}

          {suits.map(suit => {
            const sym = { SPADES: '♠', HEARTS: '♥', CLUBS: '♣', DIAMONDS: '♦' }[suit]
            const color = (suit === 'HEARTS' || suit === 'DIAMONDS') ? 'red.400' : 'gray.300'
            return (
              <Flex key={suit} align="center" gap={2} bg="gray.800" px={3} py={2} borderRadius="md" borderWidth="1px" borderColor="gray.700">
                <Text fontSize="1.4rem" color={color} minW="20px">{sym}</Text>
                <Wrap spacing={1}>
                  {allCards.filter(c => c.suit === suit).map(card => (
                    <WrapItem key={`${card.rank}_${card.suit}`}>
                      <CardDisplay
                        card={card}
                        size="sm"
                        isDisabled={myCardIds.has(`${card.rank}_${card.suit}`)}
                        isSelected={isSelected(card)}
                        onClick={() => toggleCard(card)}
                      />
                    </WrapItem>
                  ))}
                </Wrap>
              </Flex>
            )
          })}

          {picks.length === 2 && (
            <Button colorScheme="green" isLoading={actionInProgress}
              onClick={() => selectAllies(picks[0], picks[1])}>
              Confirm Allies
            </Button>
          )}
        </VStack>
      ) : (
        <Text color="gray.400">Waiting for the leader to call allies...</Text>
      )}
    </Flex>
  )
}

export default GameSelectAlliesUI
