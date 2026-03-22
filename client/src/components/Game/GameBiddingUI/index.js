import React, { useState } from 'react'
import {
  Badge, Button, Flex, HStack, NumberDecrementStepper, NumberIncrementStepper,
  NumberInput, NumberInputField, NumberInputStepper, Text, VStack,
} from '@chakra-ui/react'

import { useGameContext } from '../../../context/GameContext'
import HandDisplay from '../HandDisplay'

const MIN_BID = 280
const MAX_BID = 508

const BidsList = () => {
  const { game } = useGameContext()
  if (!game?.bids || !Object.keys(game.bids).length) return null

  return (
    <VStack spacing={1} mt={4}>
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

const GameBiddingUI = () => {
  const { game, getMyHand, getMyBid, placeBid, cancelBid, finalizeBidding, isPlayerAdmin } = useGameContext()
  const [bidAmount, setBidAmount] = useState(MIN_BID)

  const cards = getMyHand()
  const hasBid = getMyBid() !== null

  return (
    <Flex direction="column" align="center" gap={6} mt={4}>
      <HandDisplay cards={cards} label="Your Cards" />

      <VStack spacing={3}>
        <Text fontWeight="bold" color="gray.200">Place Your Bid ({MIN_BID}–{MAX_BID})</Text>
        <HStack>
          <NumberInput
            min={MIN_BID} max={MAX_BID} step={10}
            value={bidAmount}
            onChange={(_, v) => setBidAmount(v)}
            w="120px"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Button
            colorScheme="green" size="sm"
            
            onClick={() => placeBid(bidAmount)}
          >
            Bid
          </Button>
          <Button
            colorScheme="red" variant="outline" size="sm"
            
            isDisabled={!hasBid}
            onClick={() => cancelBid()}
          >
            Cancel
          </Button>
        </HStack>
      </VStack>

      <BidsList />

      {isPlayerAdmin() && (
        <Button
          mt={4} colorScheme="yellow" color="gray.800"
          
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
    </Flex>
  )
}

export default GameBiddingUI
