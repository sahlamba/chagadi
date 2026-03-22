import React from 'react'
import { Box, Text } from '@chakra-ui/react'

const suitColor = { '♥': 'red.500', '♦': 'red.500', '♣': 'gray.800', '♠': 'gray.800' }

const suitSymbols = { HEARTS: '♥', DIAMONDS: '♦', CLUBS: '♣', SPADES: '♠' }
const rankSymbols = {
  ACE: 'A', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7',
  EIGHT: '8', NINE: '9', TEN: '10', JACK: 'J', QUEEN: 'Q', KING: 'K',
}

export const cardSymbol = (card) => `${rankSymbols[card.rank] || '?'}${suitSymbols[card.suit] || '?'}`
export const cardColor = (card) => suitColor[suitSymbols[card.suit]] || 'gray.800'

const CardDisplay = ({ card, onClick, isSelected, isDisabled, size = 'md' }) => {
  const hidden = !card.visible
  const sizes = { sm: { w: '40px', h: '56px', fs: '0.7rem' }, md: { w: '52px', h: '72px', fs: '0.9rem' }, lg: { w: '64px', h: '88px', fs: '1.1rem' } }
  const s = sizes[size] || sizes.md

  return (
    <Box
      w={s.w} h={s.h}
      border="2px solid"
      borderColor={isSelected ? 'purple.500' : 'gray.300'}
      borderRadius="md"
      bg={hidden ? 'gray.600' : 'white'}
      display="flex" alignItems="center" justifyContent="center"
      cursor={onClick && !isDisabled ? 'pointer' : 'default'}
      opacity={isDisabled ? 0.5 : 1}
      boxShadow={isSelected ? '0 0 0 2px var(--chakra-colors-purple-300)' : 'sm'}
      _hover={onClick && !isDisabled ? { borderColor: 'purple.400' } : {}}
      onClick={onClick && !isDisabled ? () => onClick(card) : undefined}
    >
      {hidden ? (
        <Text fontSize={s.fs} color="white" fontWeight="bold">?</Text>
      ) : (
        <Text fontSize={s.fs} fontWeight="bold" color={cardColor(card)}>
          {cardSymbol(card)}
        </Text>
      )}
    </Box>
  )
}

export default CardDisplay
