import React from 'react'
import { Flex, Wrap, WrapItem, Text } from '@chakra-ui/react'
import CardDisplay, { sortCards } from './CardDisplay'

const HandDisplay = ({ cards, onCardClick, selectedCard, label }) => {
  if (!cards || !cards.length) return null

  const sorted = sortCards(cards)

  return (
    <Flex direction="column" align="center">
      {label && <Text mb={2} fontSize="sm" color="gray.400">{label}</Text>}
      <Wrap spacing={1} justify="center">
        {sorted.map((card, i) => (
          <WrapItem key={`${card.suit}_${card.rank}_${i}`}>
            <CardDisplay
              card={card}
              onClick={onCardClick}
              isSelected={selectedCard && selectedCard.suit === card.suit && selectedCard.rank === card.rank}
            />
          </WrapItem>
        ))}
      </Wrap>
    </Flex>
  )
}

export default HandDisplay
