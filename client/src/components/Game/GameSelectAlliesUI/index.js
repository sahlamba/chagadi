import React, { useState } from 'react'
import { Button, Flex, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react'

import { useGameContext } from '../../../context/GameContext'
import TableLayout from '../TableLayout'
import CardDisplay from '../CardDisplay'
import HandDisplay from '../HandDisplay'
import { sortCards } from '../CardDisplay'

const suits = ['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS']
const ranks = ['ACE', 'KING', 'QUEEN', 'JACK', 'TEN', 'NINE', 'EIGHT', 'SEVEN', 'SIX', 'FIVE', 'FOUR', 'THREE', 'TWO']
const suitSymbols = { SPADES: '♠', HEARTS: '♥', CLUBS: '♣', DIAMONDS: '♦' }
const suitColors = { HEARTS: 'red.400', DIAMONDS: 'red.400', CLUBS: 'gray.100', SPADES: 'gray.100' }

const allCardsForMode = (maxPlayers) => {
  const r = maxPlayers === 4 ? ranks : ranks.filter(r => r !== 'TWO')
  return suits.flatMap(suit => r.map(rank => ({ suit, rank, visible: true })))
}

const ConfirmButton = ({ picks, allyCount, actionInProgress, onConfirm }) => (
  picks.length === allyCount ? (
    <Button colorScheme="green" size="sm" isLoading={actionInProgress} onClick={onConfirm}>
      Confirm {allyCount === 1 ? 'Ally' : 'Allies'}
    </Button>
  ) : null
)

const AllyControls = () => {
  const { game, getMyHand, isLeader, selectAllies, actionInProgress } = useGameContext()
  const [picks, setPicks] = useState([])
  const allyCount = game?.settings?.maxPlayers === 4 ? 1 : 2
  const allCards = allCardsForMode(game?.settings?.maxPlayers)

  if (!isLeader()) {
    return <Text color="gray.400">Waiting for <Text as="span" fontWeight="bold" color="yellow.300">{game.players[game.leaderId]?.player?.name || 'the leader'}</Text> to call {allyCount === 1 ? 'an ally' : 'allies'}...</Text>
  }

  const myCards = getMyHand()
  const myCardIds = new Set(myCards.map(c => `${c.rank}_${c.suit}`))
  const isSelected = (card) => picks.some(p => p.suit === card.suit && p.rank === card.rank)

  const toggleCard = (card) => {
    if (myCardIds.has(`${card.rank}_${card.suit}`)) return
    if (isSelected(card)) {
      setPicks(picks.filter(p => !(p.suit === card.suit && p.rank === card.rank)))
    } else if (picks.length < allyCount) {
      setPicks([...picks, { suit: card.suit, rank: card.rank }])
    }
  }

  const onConfirm = () => selectAllies(...picks)

  return (
    <VStack spacing={3} w="100%">
      <HandDisplay cards={sortCards(myCards)} label="Your Hand" />

      {game?.trumpSuit && (
        <Text fontSize="xs" color="gray.400">
          Trump: <Text as="span" fontSize="md" color={suitColors[game.trumpSuit]}>{suitSymbols[game.trumpSuit]}</Text>
        </Text>
      )}

      <Text fontWeight="bold" color="yellow.300" fontSize="sm">Tap {allyCount} card{allyCount > 1 ? 's' : ''} to call as {allyCount === 1 ? 'ally' : 'allies'}</Text>

      <ConfirmButton picks={picks} allyCount={allyCount} actionInProgress={actionInProgress} onConfirm={onConfirm} />

      {suits.map(suit => (
        <Flex key={suit} align="center" gap={2} bg="gray.800" px={2} py={1} borderRadius="md" borderWidth="1px" borderColor="gray.700">
          <Text fontSize="1.2rem" color={suitColors[suit]} minW="16px">{suitSymbols[suit]}</Text>
          <Wrap spacing={1}>
            {allCards.filter(c => c.suit === suit).map(card => (
              <WrapItem key={`${card.rank}_${card.suit}`}>
                <CardDisplay
                  card={card} size="sm"
                  isDisabled={myCardIds.has(`${card.rank}_${card.suit}`)}
                  isSelected={isSelected(card)}
                  onClick={() => toggleCard(card)}
                />
              </WrapItem>
            ))}
          </Wrap>
        </Flex>
      ))}

      <ConfirmButton picks={picks} allyCount={allyCount} actionInProgress={actionInProgress} onConfirm={onConfirm} />
    </VStack>
  )
}

const GameSelectAlliesUI = () => (
  <TableLayout hideHand>
    <AllyControls />
  </TableLayout>
)

export default GameSelectAlliesUI
