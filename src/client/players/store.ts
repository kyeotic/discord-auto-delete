import { Player } from '../tournaments/types'
import { SignalStore } from '../data/signalStore'
import { TrpcAppClient } from '../data/trpc'
import { nanoid } from 'nanoid'

export interface PlayerSignals {
  players: Player[]
}

export class PlayerStore extends SignalStore<PlayerSignals> {
  constructor(private trpc: TrpcAppClient) {
    super({ players: [] })
    this.init().catch((e) => console.error('player store init', e))
  }

  async init() {
    const players = await this.trpc.players.getAll.query()
    this.setStore('players', players)
  }

  async create(name: string): Promise<Player> {
    const newPlayer = await this.trpc.players.create.mutate({
      id: nanoid(),
      name,
    })
    this.setStore('players', this.store.players.length, newPlayer)
    return newPlayer
  }

  get players(): Player[] {
    return this.store.players
  }
}
