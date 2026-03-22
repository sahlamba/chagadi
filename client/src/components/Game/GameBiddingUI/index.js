import React, { useState } from 'react'
import {
  Badge, Button, Flex, HStack, NumberDecrementStepper, NumberIncrementStepper,
  NumberInput, NumberInputField, NumberInputStepper, Text, VStack,
} from '@chakra-ui/react'

import { useGameContext } from '../../../context/GameContext'
import TableLayout from '../TableLayout'

const MIN_BID = 280
const MAX_BID = 508

const BidsList = () => {
  const { game } = useGameContext()
  if (!game?.bids || !Object.keys(game.bids).length) return null

  return (
    <VStack spacing={1}>
      <Text fontSize="sm" color="gray.400">Current Bids</Text>
      {Object.entries(game.bids).map(([pid, amount]) => {
        const ps = game.players[pid]
        return (
          <HStack key={pid}>
            <Text fontSize="sm" color="gray.200">{ps?.player?.name || pid}:</Text>
            <Badge colorScheme="yellow">{amount}</Badge>
          </HStack>
        )
      })}
    </VStack>
  )
}

const BiddingControls = () => {
  const { game, getMyBid, placeBid, cancelBid, finalizeBidding, isPlayerAdmin } = useGameContext()
  const [bidAmount, setBidAmount] = useState(MIN_BID)
  const hasBid = getMyBid() !== null

  return (
    <VStack spacing={3}>
      <Text fontWeight="bold" color="gray.200" fontSize="sm">Bid ({MIN_BID}–{MAX_BID})</Text>
      <HStack>
        <NumberInput
          min={MIN_BID} max={MAX_BID} step={10}
          value={bidAmount} onChange={(_, v) => setBidAmount(v)}
          w="100px" size="sm"
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Button colorScheme="green" size="sm" onClick={() => placeBid(bidAmount)}>Bid</Button>
        <Button colorScheme="red" variant="outline" size="sm" isDisabled={!hasBid} onClick={() => cancelBid()}>Cancel</Button>
      </HStack>
      <BidsList />
      {isPlayerAdmin() && (
        <Button
          size="sm" colorScheme="yellow" color="gray.800"
          isDisabled={!game?.bids || !Object.keys(game.bids).length}
          onClick={() => {
            const entries = Object.entries(game.bids)
            const [leaderId] = entries.reduce((best, cur) => cur[1] > best[1] ? cur : best)
            finalizeBidding(leaderId)
          }}
        >
          Finalize Bidding
        </Button>
      )}
    </VStack>
  )
}

const GameBiddingUI = () => (
  <TableLayout>
    <BiddingControls />
  </TableLayout>
)

export default GameBiddingUI
