import { listAllValues, create, makeSet } from '../util/kv.ts'
import { Player } from './types.ts'

const PLAYERS = makeSet('PLAYERS')

export default class PlayerStore {
  constructor(private readonly kv: Deno.Kv) {}

  async getForUser(userId: string): Promise<Player[]> {
    return await listAllValues(this.kv, PLAYERS(userId))
  }

  async create(userId: string, player: Player): Promise<Player> {
    return await create(this.kv, PLAYERS(userId, player.id), player)
  }
}
