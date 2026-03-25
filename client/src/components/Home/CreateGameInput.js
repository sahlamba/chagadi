import React from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'

const CreateGameInput = ({ onSubmit, isCreatingGame }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [maxPlayers, setMaxPlayers] = React.useState(6)

  const submit = (evt) => {
    evt.preventDefault()
    onSubmit({ gameSettings: { maxPlayers } })
  }

  return (
    <React.Fragment>
      <Button
        colorScheme="yellow"
        variant="outline"
        rightIcon={<AddIcon />}
        onClick={onOpen}>
        Create Game
      </Button>
      <Modal closeOnOverlayClick={false} onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>New Chagadi Game</ModalHeader>
          <ModalCloseButton color="red.300" />
          <form onSubmit={submit}>
            <ModalBody>
              <Stack spacing={3}>
                <Text>Select number of players:</Text>
                <Stack direction="row" spacing={2}>
                  {[4, 6].map((n) => (
                    <Button key={n} size="sm" variant={maxPlayers === n ? 'solid' : 'outline'} colorScheme="yellow" onClick={() => setMaxPlayers(n)}>{n} Players</Button>
                  ))}
                </Stack>
                <Text fontSize="sm" color="gray.400">
                  {maxPlayers === 4 ? '52 cards, 13 each, 2v2 teams' : '48 cards, 8 each, 3v3 teams'}
                </Text>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Stack direction="row" spacing={2}>
                <Button onClick={onClose} disabled={isCreatingGame} colorScheme="red" variant="outline">Close</Button>
                <Button type="submit" colorScheme="yellow" variant="solid" isLoading={isCreatingGame}>
                  Create
                </Button>
              </Stack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </React.Fragment>
  )
}

export default CreateGameInput
