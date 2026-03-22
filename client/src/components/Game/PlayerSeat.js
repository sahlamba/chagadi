import React from 'react'
import { Avatar, Box, Flex, Text } from '@chakra-ui/react'

const miniCardStyle = (i, total) => ({
  position: 'absolute',
  width: '18px',
  height: '26px',
  bg: 'gray.500',
  border: '1px solid',
  borderColor: 'gray.400',
  borderRadius: '3px',
  left: `${i * 8}px`,
  transform: `rotate(${(i - (total - 1) / 2) * 10}deg)`,
})

const PlayerSeat = ({ playerState, isActive }) => {
  const { player } = playerState
  const cardCount = playerState.hand?.cards?.length ?? playerState.hand?.cardCount ?? 0
  const fanCards = Math.min(cardCount, 3)

  return (
    <Flex
      direction="column" align="center" gap={0}
      px={1} py={1}
      borderRadius="lg"
      border="2px solid"
      borderColor={isActive ? 'yellow.400' : 'transparent'}
      boxShadow={isActive ? '0 0 12px var(--chakra-colors-yellow-400)' : 'none'}
      transition="all 0.2s ease"
      minW="50px"
      maxW="72px"
    >
      <Avatar size="xs" name={player.name} mb={-1} zIndex={0} />
      {cardCount > 0 && (
        <Box position="relative" h="28px" w={`${(fanCards - 1) * 8 + 18}px`} zIndex={1}>
          {Array.from({ length: fanCards }).map((_, i) => (
            <Box key={i} {...miniCardStyle(i, fanCards)} />
          ))}
        </Box>
      )}
      <Text fontSize="2xs" color="gray.400" textAlign="center" wordBreak="break-word" lineHeight="1.2" mt={1}>
        {player.name}
      </Text>
    </Flex>
  )
}

export default PlayerSeat
