import React from 'react'
import { Link } from 'react-router-dom'
import { Flex, Heading, Text, Avatar } from '@chakra-ui/react'

const Header = ({ player }) => {
  return (
    <Flex
      py={8}
      px={16}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      bg="gray.800"
      color="yellow.400"
      boxShadow="dark-lg">
      <Heading>
        <Link to="/">Chagadi</Link>
      </Heading>
      {player ? (
        <Flex direction="column" alignItems="center">
          <Avatar size="sm" name={player.name} iconLabel={player.name} bg="yellow.500" color="gray.900" />
          <Text fontSize="sm" color="gray.300">{player.name}</Text>
        </Flex>
      ) : null}
    </Flex>
  )
}

export default Header
