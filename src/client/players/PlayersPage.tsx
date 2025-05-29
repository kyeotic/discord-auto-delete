import { Show, type JSX, For } from 'solid-js'
import { createFormGroup, createFormControl } from 'solid-forms'
import { Button, H1, H2, LabelItem } from '../components'
import { TextInput } from '../components/Forms'
import { useStores } from '../data/stores'

export default function PlayersPage(): JSX.Element {
  return (
    <>
      <PlayerList />
      <NewPlayerForm />
    </>
  )
}

export function NewPlayerForm(): JSX.Element {
  const { players: store } = useStores()
  const form = createFormGroup({
    name: createFormControl(''),
  })

  async function submit(e: Event) {
    e.preventDefault()
    const name = form.value.name!
    const newPlayer = await store.create(name)
    console.log('player added', newPlayer)
    form.controls.name.setValue('')
  }

  return (
    <div>
      <H2>Add Player</H2>
      <form onsubmit={submit}>
        <TextInput label="Player Name" control={form.controls.name} />

        <Button type="submit" primary>
          Create
        </Button>
      </form>
    </div>
  )
}

export function PlayerList(): JSX.Element {
  const store = usePlayerStore()

  return (
    <div>
      <H1>Players</H1>

      <div class="flex">
        <Show when={!store.players.length}>
          <span class="mt-4">No Players</span>
        </Show>
        <div class="flex flex-col gap-4 mt-4">
          <For each={store.players}>
            {(player) => <LabelItem label="Name" text={player.name} />}
          </For>
        </div>
      </div>
    </div>
  )
}
