import { lazy } from '@kyeotic/server'
import ConfigStore from './configStore.ts'
import config from './config.ts'
import { REST } from 'discord.js'

export interface AppContext {
  config: typeof config
  discord: REST
  stores: {
    configs: ConfigStore
  }
}

export const appContext = lazy(createContext)

async function createContext(): Promise<AppContext> {
  const kv = await Deno.openKv(config.kv.targetUrl)
  const rest = new REST({ version: config.discord.version }).setToken(
    config.discord.token,
  )
  return {
    discord: rest,
    config,
    stores: {
      configs: new ConfigStore(kv),
    },
  }
}
