import React, { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Flex, Heading, List, ListItem, Link, useToast } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

import GameSettings from '../../models/GameSettings'
import { usePlayerContext } from '../../context/PlayerContext'

import { createGame, getPlayerGamesById } from '../../utils/apiClient'
import { notify } from '../../utils/ui'

import Header from '../Header'
import JoinGameInput from './JoinGameInput'
import CreateGameInput from './CreateGameInput'

const Home = () => {
  const navigate = useNavigate()

  const { player, verifyPlayerOrRedirect } = usePlayerContext()

  const [playerGameCodeMappings, setPlayerGameCodeMappings] = useState([])
  const [isCreatingGame, setIsCreatingGame] = useState(false)

  const toast = useToast()

  const getAndSetPlayerGames = async () => {
    try {
      if (!player) {
        return
      }
      const res = await getPlayerGamesById(player.id)
      setPlayerGameCodeMappings(res)
    } catch (error) {
      notify(toast, { title: error, status: 'error' })
    }
  }

  useEffect(() => {
    verifyPlayerOrRedirect()
    getAndSetPlayerGames()
  }, [])

  const joinGameOnSubmit = ({ gameCode }) => {
    navigate(`/game/${gameCode.toUpperCase()}`)
  }

  const createGameOnSubmit = async ({ gameSettings }) => {
    setIsCreatingGame(true)
    try {
      const game = await createGame(player, GameSettings.from(gameSettings))
      navigate(`/game/${game.code}`)
    } catch (error) {
      notify(toast, { title: error, status: 'error' })
    }
    setIsCreatingGame(false)
  }

  return (
    <React.Fragment>
      <Header player={player} />
      <Flex
        py={12}
        px={4}
        direction="column"
        alignItems="center"
        justifyContent="center">
        <JoinGameInput onSubmit={joinGameOnSubmit} />
        <Heading my={6} size="sm">
          OR
        </Heading>
        <CreateGameInput
          onSubmit={createGameOnSubmit}
          isCreatingGame={isCreatingGame}
        />
      </Flex>
      {playerGameCodeMappings && playerGameCodeMappings.length ? (
        <Flex direction="column" alignItems="center" justifyContent="center">
          <Heading as="u" mb={4} size="md" color="yellow.400">
            Your Live Games
          </Heading>
          <List spacing={2}>
            {playerGameCodeMappings.map(({ gameCode }) => (
              <ListItem key={gameCode}>
                <Link
                  as={RouterLink}
                  to={`/game/${gameCode}`}
                  isExternal
                  color="yellow.400">
                  {gameCode} <ExternalLinkIcon mx="2px" />
                </Link>
              </ListItem>
            ))}
          </List>
        </Flex>
      ) : null}
    </React.Fragment>
  )
}

export default Home
