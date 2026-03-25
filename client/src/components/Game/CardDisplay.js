import React from 'react'
import { Box, Text } from '@chakra-ui/react'
import { useGameContext } from '../../context/GameContext'

const redSuits = new Set(['HEARTS', 'DIAMONDS'])

export const sortCards = (cards, cardMeta) => {
  if (!cardMeta) return cards
  const visible = cards.filter(c => c.visible !== false)
  const hidden = cards.filter(c => c.visible === false)
  const sorted = [...visible].sort((a, b) =>
    (cardMeta.suits[a.suit]?.order ?? 9) - (cardMeta.suits[b.suit]?.order ?? 9) ||
    (cardMeta.ranks[a.rank]?.trumpOrder ?? 99) - (cardMeta.ranks[b.rank]?.trumpOrder ?? 99)
  )
  return [...sorted, ...hidden]
}

export const cardSymbol = (card, cardMeta) => {
  const r = cardMeta?.ranks[card.rank]?.symbol || '?'
  const s = cardMeta?.suits[card.suit]?.symbol || '?'
  return `${r}${s}`
}

export const cardColor = (card) => redSuits.has(card.suit) ? 'red.500' : 'gray.800'

export const suitSymbol = (suit, cardMeta) => cardMeta?.suits[suit]?.symbol || '?'

const CardDisplay = ({ card, onClick, isSelected, isDisabled, size = 'md' }) => {
  const { game } = useGameContext()
  const meta = game?.cardMeta
  const hidden = !card.visible
  const sizes = { sm: { w: '40px', h: '56px', fs: '0.7rem' }, md: { w: '52px', h: '72px', fs: '0.9rem' }, lg: { w: '64px', h: '88px', fs: '1.1rem' } }
  const s = sizes[size] || sizes.md
  const clickable = onClick && !isDisabled

  return (
    <Box pb="8px" pt="8px">
    <Box
      w={s.w} h={s.h}
      border="2px solid"
      borderColor={isSelected ? 'yellow.400' : 'gray.500'}
      borderRadius="md"
      bg={hidden ? 'gray.600' : isSelected ? 'yellow.100' : 'white'}
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
          {cardSymbol(card, meta)}
        </Text>
      )}
    </Box>
    </Box>
  )
}

export default CardDisplay
