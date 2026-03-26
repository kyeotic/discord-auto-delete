import { WorkerEnv } from './types.ts'

export interface AppConfig {
  discord: {
    version: string
    token: string
    publicKey: string
    guildId: string | undefined
  }
}

export function getConfig(env: WorkerEnv): AppConfig {
  return {
    discord: {
      version: '10',
      token: env.BOT_TOKEN,
      publicKey: env.DISCORD_PUBLIC_KEY,
      guildId: undefined,
    },
  }
}
