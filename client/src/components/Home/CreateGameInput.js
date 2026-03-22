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

  const submit = (evt) => {
    evt.preventDefault()
    onSubmit({ gameSettings: { maxPlayers: 6 } })
  }

  return (
    <React.Fragment>
      <Button
        colorScheme="purple"
        variant="outline"
        rightIcon={<AddIcon />}
        onClick={onOpen}>
        Create Game
      </Button>
      <Modal closeOnOverlayClick={false} onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Chagadi Game</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={submit}>
            <ModalBody>
              <Text>6 players required. Cards will be dealt after all players are ready.</Text>
            </ModalBody>
            <ModalFooter>
              <Stack direction="row" spacing={2}>
                <Button onClick={onClose} disabled={isCreatingGame}>Close</Button>
                <Button type="submit" colorScheme="purple" variant="solid" isLoading={isCreatingGame}>
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
