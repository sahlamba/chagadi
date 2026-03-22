import React from 'react'
import { Avatar, Badge, Box, Flex, Text } from '@chakra-ui/react'

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

const PlayerSeat = ({ playerState, isActive, isLeader }) => {
  const { player, team, wonTricks } = playerState
  const cardCount = playerState.hand?.cards?.length ?? playerState.hand?.cardCount ?? 0
  const fanCards = Math.min(cardCount, 3)
  const tricksWon = wonTricks?.length || 0
  const score = wonTricks?.reduce((s, t) => s + t.points, 0) || 0

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
      <Box position="relative">
        <Avatar size="xs" name={player.name} bg={player.color || 'yellow.500'} color="gray.900" mb={-1} zIndex={0} />
        {isLeader && (
          <Text position="absolute" top="-6px" right="-6px" fontSize="xs" lineHeight="1">⭐</Text>
        )}
      </Box>
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
      {tricksWon > 0 && (
        <Text fontSize="2xs" color="yellow.300">{tricksWon}T · {score}pts</Text>
      )}
      {team && (
        <Badge fontSize="2xs" colorScheme={team === 'leader' ? 'yellow' : 'red'} variant="subtle">{team}</Badge>
      )}
    </Flex>
  )
}

export default PlayerSeat
