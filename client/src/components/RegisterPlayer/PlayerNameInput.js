import React from 'react'
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import { ArrowRightIcon } from '@chakra-ui/icons'
import { usePlayerContext } from '../../context/PlayerContext'

const PlayerNameInput = () => {
  const { player, randomName, updateName, persistPlayer } = usePlayerContext()

  return (
    <Flex maxW="100%" mt={8} alignItems="center" justifyContent="center">
      <form onSubmit={persistPlayer}>
        <FormControl>
          <FormLabel htmlFor="player-name">Player Name</FormLabel>
          <InputGroup size="lg">
            <Input
              id="player-name"
              w="20rem"
              maxW="100%"
              size="lg"
              placeholder={randomName}
              value={player ? player : ''}
              onChange={updateName}
            />
            <InputRightElement width="auto">
              <Button
                type="submit"
                size="lg"
                colorScheme="yellow"
                variant="solid"
                rightIcon={<ArrowRightIcon />}>
                Go
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
      </form>
    </Flex>
  )
}

export default PlayerNameInput
