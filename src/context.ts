import { AppConfig, getConfig } from './config.ts'
import ConfigStore from './configStore.ts'
import { WorkerEnv } from './types.ts'

export interface AppContext {
  config: AppConfig
  discordRequest(method: string, path: string, body?: unknown): Promise<unknown>
  stores: {
    configs: ConfigStore
  }
}

export function createContext(env: WorkerEnv): AppContext {
  const config = getConfig(env)
  return {
    config,
    discordRequest: (method, path, body) =>
      discordFetch(method, path, config.discord.token, body),
    stores: {
      configs: new ConfigStore(env.CONFIGS_KV),
    },
  }
}

async function discordFetch(
  method: string,
  path: string,
  token: string,
  body?: unknown,
): Promise<unknown> {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Discord API error: ${res.status}`)
  return res.json()
}
