/// <reference lib="deno.unstable"/>
import { listAllValues, makeSet } from '@kyeotic/server/kv'
import { ChannelConfig } from './types.ts'

const CONFIGS = makeSet('CONFIGS')

export default class ConfigStore {
  constructor(private readonly kv: Deno.Kv) {}

  async get(guildId: string, channelId: string): Promise<ChannelConfig | null> {
    return (await this.kv.get<ChannelConfig>(CONFIGS(guildId, channelId)))
      ?.value
  }

  async set(config: ChannelConfig) {
    await this.kv.set(CONFIGS(config.guildId, config.channelId), config)
  }

  // TODO: replace this with a paging function
  async getAll(): Promise<ChannelConfig[]> {
    return await listAllValues(this.kv, CONFIGS())
  }
}
