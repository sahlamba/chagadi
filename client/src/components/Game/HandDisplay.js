import React from 'react'
import { Flex, Wrap, WrapItem, Text } from '@chakra-ui/react'
import CardDisplay from './CardDisplay'

const HandDisplay = ({ cards, onCardClick, selectedCard, label }) => {
  if (!cards || !cards.length) return null

  return (
    <Flex direction="column" align="center">
      {label && <Text mb={2} fontSize="sm" color="gray.500">{label}</Text>}
      <Wrap spacing={1} justify="center">
        {cards.map((card, i) => (
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
