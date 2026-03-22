import React, { useState } from 'react'
import {
  Badge, Button, Flex, HStack, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalHeader, ModalOverlay, Text, VStack, useDisclosure,
} from '@chakra-ui/react'

import { useGameContext } from '../../../context/GameContext'
import TableLayout from '../TableLayout'
import CardDisplay from '../CardDisplay'

const suitSymbols = { CLUBS: '♣', HEARTS: '♥', SPADES: '♠', DIAMONDS: '♦' }

const playerName = (game, pid) => game.players[pid]?.player?.name || pid

const TrickArea = () => {
  const { game } = useGameContext()
  const turn = game?.currentTurn
  if (!turn) return null

  return (
    <VStack spacing={2}>
      {turn.leadSuit && (
        <Text fontSize="xs" color="gray.400">Lead: {suitSymbols[turn.leadSuit]}</Text>
      )}
      <HStack spacing={2} wrap="wrap" justify="center">
        {turn.playedCards.map(({ playerId, card }, i) => (
          <VStack key={i} spacing={0}>
            <CardDisplay card={{ ...card, visible: true }} size="md" />
            <Text fontSize="2xs" color="gray.400">{playerName(game, playerId)}</Text>
          </VStack>
        ))}
      </HStack>
    </VStack>
  )
}

const LastTurnResult = () => {
  const { game } = useGameContext()
  const r = game?.lastTurnResult
  if (!r) return null

  return (
    <Text fontSize="xs" color="green.300" textAlign="center">
      Last trick: {playerName(game, r.winnerId)} won {r.trickPoints} pts
    </Text>
  )
}

const TurnInfo = () => {
  const { game, isMyTurn, requestTrumpReveal } = useGameContext()
  const turn = game?.currentTurn
  if (!turn) return null

  const activeId = turn.playOrder[turn.playedCards.length]

  return (
    <VStack spacing={2}>
      <Text fontSize="sm" color={isMyTurn() ? 'yellow.300' : 'gray.300'} fontWeight="bold">
        {isMyTurn()
          ? 'Your turn — tap a card to play'
          : <Text as="span">Waiting for <Text as="span" fontWeight="bold" color="yellow.300">{playerName(game, activeId)}</Text>...</Text>
        }
      </Text>
      {game.trumpSuit && (
        <Badge colorScheme={game.trumpRevealed ? 'yellow' : 'gray'}>
          Trump: {game.trumpRevealed ? suitSymbols[game.trumpSuit] : '?'}
        </Badge>
      )}
      {!game.trumpRevealed && isMyTurn() && turn.leadSuit && (
        <Button size="xs" colorScheme="red" variant="outline" onClick={() => requestTrumpReveal()}>
          Reveal Trump
        </Button>
      )}
      <Text fontSize="xs" color="gray.500">Turn {(game.turnNumber || 0) + 1} / 8</Text>
    </VStack>
  )
}

const TrickModal = ({ tricks, playerName: name, isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
    <ModalOverlay />
    <ModalContent bg="gray.800" color="white">
      <ModalHeader fontSize="sm">{name}'s Tricks</ModalHeader>
      <ModalCloseButton color="red.300" />
      <ModalBody pb={4}>
        {tricks.map((t, i) => (
          <VStack key={i} spacing={1} mb={3} align="start">
            <Text fontSize="xs" color="gray.400">Trick {i + 1} — {t.points} pts</Text>
            <HStack spacing={1} wrap="wrap">
              {t.cards.map((c, j) => (
                <CardDisplay key={j} card={{ ...c, visible: true }} size="sm" />
              ))}
            </HStack>
          </VStack>
        ))}
      </ModalBody>
    </ModalContent>
  </Modal>
)

const MyTricksButton = () => {
  const { game, player } = useGameContext()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const ps = game?.players?.[player?.id]
  const tricks = ps?.wonTricks || []
  if (!tricks.length) return null

  const score = tricks.reduce((s, t) => s + t.points, 0)
  return (
    <>
      <Button size="xs" variant="outline" colorScheme="yellow" onClick={onOpen}>
        My tricks: {tricks.length} ({score} pts)
      </Button>
      <TrickModal tricks={tricks} playerName="You" isOpen={isOpen} onClose={onClose} />
    </>
  )
}

const PlayingContent = () => (
  <VStack spacing={3} w="100%">
    <TurnInfo />
    <LastTurnResult />
    <TrickArea />
    <MyTricksButton />
  </VStack>
)

const GameOverContent = () => {
  const { game, getMyTeam } = useGameContext()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [modalPlayer, setModalPlayer] = useState(null)
  const myTeam = getMyTeam()
  const won = game.winnerId === myTeam

  const bid = Math.max(0, ...Object.values(game.bids || {}))
  const leaderScore = Object.values(game.players)
    .filter(ps => ps.team === 'leader')
    .reduce((s, ps) => s + (ps.wonTricks?.reduce((t, tr) => t + tr.points, 0) || 0), 0)
  const enemyScore = Object.values(game.players)
    .filter(ps => ps.team === 'enemy')
    .reduce((s, ps) => s + (ps.wonTricks?.reduce((t, tr) => t + tr.points, 0) || 0), 0)

  const openTricks = (ps) => { setModalPlayer(ps); onOpen() }

  return (
    <VStack spacing={3} w="100%">
      <Text fontSize="2xl" fontWeight="bold" color={won ? 'green.300' : 'red.400'}>
        {won ? '🎉 You win!' : 'You lose'}
      </Text>
      <Text fontSize="sm" color="gray.300">Your team: {myTeam}</Text>
      <HStack spacing={6}>
        <VStack>
          <Text fontSize="xs" color="gray.400">Leader</Text>
          <Badge colorScheme="yellow" fontSize="md">{leaderScore}</Badge>
        </VStack>
        <VStack>
          <Text fontSize="xs" color="gray.400">Bid</Text>
          <Badge colorScheme="gray" fontSize="md">{bid}</Badge>
        </VStack>
        <VStack>
          <Text fontSize="xs" color="gray.400">Enemy</Text>
          <Badge colorScheme="red" fontSize="md">{enemyScore}</Badge>
        </VStack>
      </HStack>
      {game.trumpSuit && (
        <Text fontSize="xs" color="gray.400">Trump: {suitSymbols[game.trumpSuit]}</Text>
      )}
      <VStack spacing={1} mt={2}>
        {Object.values(game.players).map(ps => {
          const tricks = ps.wonTricks || []
          const score = tricks.reduce((s, t) => s + t.points, 0)
          return (
            <HStack key={ps.player.id} spacing={2}>
              {ps.player.id === game.leaderId && <Text fontSize="xs">⭐</Text>}
              <Text fontSize="xs" color="gray.300">{ps.player.name}</Text>
              <Badge fontSize="2xs" colorScheme={ps.team === 'leader' ? 'yellow' : 'red'}>{ps.team}</Badge>
              {tricks.length > 0 && (
                <Button size="xs" variant="ghost" colorScheme="yellow" onClick={() => openTricks(ps)} p={0} h="auto" minW="auto">
                  {tricks.length}T · {score}pts
                </Button>
              )}
            </HStack>
          )
        })}
      </VStack>
      {modalPlayer && (
        <TrickModal
          tricks={modalPlayer.wonTricks || []}
          playerName={modalPlayer.player.name}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </VStack>
  )
}

const GamePlayUI = () => {
  const { isGameOver, isMyTurn, playCard } = useGameContext()

  const onCardClick = isMyTurn() && !isGameOver()
    ? (card) => playCard({ suit: card.suit, rank: card.rank })
    : undefined

  return (
    <TableLayout onCardClick={onCardClick}>
      {isGameOver() ? <GameOverContent /> : <PlayingContent />}
    </TableLayout>
  )
}

export default GamePlayUI
