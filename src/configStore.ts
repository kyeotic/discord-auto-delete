import { ChannelConfig } from './types.ts'

const PREFIX = 'CONFIGS'

function configKey(guildId: string, channelId: string): string {
  return `${PREFIX}:${guildId}:${channelId}`
}

export default class ConfigStore {
  constructor(private readonly kv: KVNamespace) {}

  async get(guildId: string, channelId: string): Promise<ChannelConfig | null> {
    const value = await this.kv.get(configKey(guildId, channelId))
    return value ? JSON.parse(value) : null
  }

  async set(config: ChannelConfig): Promise<void> {
    await this.kv.put(
      configKey(config.guildId, config.channelId),
      JSON.stringify(config),
    )
  }

  async getAll(): Promise<ChannelConfig[]> {
    const list = await this.kv.list({ prefix: `${PREFIX}:` })
    const results = await Promise.all(
      list.keys.map(async ({ name }) => {
        const value = await this.kv.get(name)
        return value ? (JSON.parse(value) as ChannelConfig) : null
      }),
    )
    return results.filter((v: ChannelConfig | null): v is ChannelConfig => v !== null)
  }
}
