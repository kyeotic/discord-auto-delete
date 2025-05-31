import { lazy } from '@kyeotic/server'
import ConfigStore from './store.ts'
import config from './config.ts'
import Discord from './discord.ts'

export interface AppContext {
  config: typeof config
  discord: Discord
  stores: {
    configs: ConfigStore
  }
}

export const appContext = lazy(createContext)

async function createContext(): Promise<AppContext> {
  const kv = await Deno.openKv(config.kv.targetUrl)
  const discord = new Discord(
    config.discord.token,
    config.discord.publicKey,
    config.discord.version,
  )
  return {
    config,
    discord,
    stores: {
      configs: new ConfigStore(kv),
    },
  }
}
