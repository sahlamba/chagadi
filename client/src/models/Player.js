import { v4 as uuidV4 } from 'uuid'

const COLORS = [
  'red.500', 'orange.500', 'yellow.500', 'green.500', 'teal.500',
  'blue.500', 'purple.500', 'pink.500', 'cyan.500', 'red.400',
]

export default class Player {
  id // Player ID: UUID
  name // Player name: string
  color // Avatar color: Chakra color token

  constructor(name) {
    this.id = uuidV4()
    this.name = name
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
  }
}
