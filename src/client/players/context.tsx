import { type ParentProps } from 'solid-js'
import { Player } from '../tournaments/types'
import { optionalContext } from '../util/context'

const { use: usePlayer, Provider: PlayerProvider } = optionalContext(
  (props: ParentProps & { player: Player }) => props.player,
)

export { usePlayer, PlayerProvider }
