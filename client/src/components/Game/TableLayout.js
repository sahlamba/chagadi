import React from 'react'
import { Badge, Box, Flex, useBreakpointValue } from '@chakra-ui/react'

import { useGameContext } from '../../context/GameContext'
import { sortCards } from './CardDisplay'
import PlayerSeat from './PlayerSeat'
import HandDisplay from './HandDisplay'

const TableLayout = ({ children, onCardClick, selectedCard, hideHand }) => {
  const { game, player, getMyHand, getMyTeam } = useGameContext()
  const seatGap = useBreakpointValue({ base: 1, md: 3 }) || 2

  if (!game?.players || !player) return null

  const meId = player.id
  const allIds = Object.keys(game.players)
  const opponentIds = allIds.filter(pid => pid !== meId)
  const currentTurnPlayerId = game.currentTurn?.playOrder?.[game.currentTurn?.playedCards?.length]

  return (
    <Flex direction="column" align="center" w="100%" maxW="800px" mx="auto" gap={2} px={2}>
      {/* Opponents */}
      <Flex justify="center" gap={seatGap} overflowX="auto" px={2} w="100%" flexShrink={0}>
        {opponentIds.map(pid => (
          <PlayerSeat
            key={pid}
            playerState={game.players[pid]}
            isActive={currentTurnPlayerId === pid}
            isLeader={game.leaderId === pid}
          />
        ))}
      </Flex>

      {getMyTeam() && (
        <Badge colorScheme={getMyTeam() === 'leader' ? 'yellow' : 'red'} fontSize="xs">
          You are {getMyTeam()} team
        </Badge>
      )}

      {/* Center — phase-specific content */}
      <Box
        w="100%" minH="120px"
        bg="gray.800" borderRadius="xl" border="1px solid" borderColor="gray.700"
        p={4} my={2}
        display="flex" alignItems="center" justifyContent="center"
        flexDirection="column"
      >
        {children}
      </Box>

      {/* You */}
      {!hideHand && (
        <Flex direction="column" align="center" w="100%">
          <HandDisplay cards={sortCards(getMyHand(), game?.cardMeta)} onCardClick={onCardClick} selectedCard={selectedCard} />
        </Flex>
      )}
    </Flex>
  )
}

export default TableLayout
