import React, { useState } from 'react'
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
} from '@chakra-ui/react'
import { ArrowRightIcon } from '@chakra-ui/icons'

import { notify } from '../../utils/ui'

const GAME_CODE_LENGTH = 6

const JoinGameInput = ({ onSubmit }) => {
  const validGameCodeDescription = `Game codes are ${GAME_CODE_LENGTH} characters long.`

  const [gameCode, setGameCode] = useState('')
  const toast = useToast()

  const updateGameCode = (evt) => {
    evt.preventDefault()
    setGameCode(evt.target.value)
  }

  const isValidGameCode = () => {
    return gameCode && gameCode.length === GAME_CODE_LENGTH
  }

  const submit = (evt) => {
    evt.preventDefault()
    if (isValidGameCode()) {
      onSubmit({ gameCode })
    } else {
      notify(toast, {
        title: 'Invalid game code!',
        description: validGameCodeDescription,
        status: 'error',
      })
    }
  }

  return (
    <Flex maxW="100%" alignItems="center" justifyContent="center">
      <form onSubmit={submit}>
        <FormControl>
          <InputGroup size="lg">
            <Input
              w="20rem"
              maxW="100%"
              size="lg"
              placeholder="Game Code"
              value={gameCode}
              onChange={updateGameCode}
              isInvalid={gameCode && !isValidGameCode()}
              errorBorderColor="crimson"
              autoComplete="off"
              autoFocus
            />
            <InputRightElement width="auto">
              <Button
                type="submit"
                size="lg"
                colorScheme="yellow"
                variant="solid"
                rightIcon={<ArrowRightIcon />}>
                Join
              </Button>
            </InputRightElement>
          </InputGroup>
          {gameCode && !isValidGameCode() ? (
            <FormHelperText textAlign="center">
              {validGameCodeDescription}
            </FormHelperText>
          ) : null}
        </FormControl>
      </form>
    </Flex>
  )
}

export default JoinGameInput
