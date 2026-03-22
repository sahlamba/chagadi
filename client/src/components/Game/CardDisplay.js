import React from 'react'
import { Box, Text } from '@chakra-ui/react'

const suitColor = { '♥': 'red.500', '♦': 'red.500', '♣': 'gray.800', '♠': 'gray.800' }

const suitSymbols = { HEARTS: '♥', DIAMONDS: '♦', CLUBS: '♣', SPADES: '♠' }
const rankSymbols = {
  ACE: 'A', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7',
  EIGHT: '8', NINE: '9', TEN: '10', JACK: 'J', QUEEN: 'Q', KING: 'K',
}

// Sort order: suit groups then by trump order (strength)
const suitOrder = { SPADES: 0, HEARTS: 1, CLUBS: 2, DIAMONDS: 3 }
const trumpOrder = { ACE: 1, KING: 2, QUEEN: 3, JACK: 4, TEN: 5, NINE: 6, EIGHT: 7, SEVEN: 8, SIX: 9, FIVE: 10, FOUR: 11, THREE: 12 }

export const sortCards = (cards) => {
  const visible = cards.filter(c => c.visible !== false)
  const hidden = cards.filter(c => c.visible === false)
  const sorted = [...visible].sort((a, b) => (suitOrder[a.suit] ?? 9) - (suitOrder[b.suit] ?? 9) || (trumpOrder[a.rank] ?? 99) - (trumpOrder[b.rank] ?? 99))
  return [...sorted, ...hidden]
}

export const cardSymbol = (card) => `${rankSymbols[card.rank] || '?'}${suitSymbols[card.suit] || '?'}`
export const cardColor = (card) => suitColor[suitSymbols[card.suit]] || 'gray.800'

const CardDisplay = ({ card, onClick, isSelected, isDisabled, size = 'md' }) => {
  const hidden = !card.visible
  const sizes = { sm: { w: '40px', h: '56px', fs: '0.7rem' }, md: { w: '52px', h: '72px', fs: '0.9rem' }, lg: { w: '64px', h: '88px', fs: '1.1rem' } }
  const s = sizes[size] || sizes.md
  const clickable = onClick && !isDisabled

  return (
    <Box
      w={s.w} h={s.h}
      border="2px solid"
      borderColor={isSelected ? 'yellow.400' : 'gray.500'}
      borderRadius="md"
      bg={hidden ? 'gray.600' : 'white'}
      display="flex" alignItems="center" justifyContent="center"
      cursor={clickable ? 'pointer' : 'default'}
      opacity={isDisabled ? 0.5 : 1}
      boxShadow={isSelected ? '0 0 8px var(--chakra-colors-yellow-300)' : 'md'}
      transition="transform 0.15s ease, box-shadow 0.15s ease"
      _hover={clickable ? { transform: 'translateY(-6px)', boxShadow: 'lg', borderColor: 'yellow.300' } : {}}
      _active={clickable ? { transform: 'translateY(-2px) scale(0.97)', boxShadow: 'sm' } : {}}
      onClick={clickable ? () => onClick(card) : undefined}
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
