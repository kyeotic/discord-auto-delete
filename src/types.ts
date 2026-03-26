import { z } from 'zod'
import {
  APIInteraction,
  APIInteractionResponse,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import type { AppContext } from './context.ts'

export interface WorkerEnv {
  BOT_TOKEN: string
  DISCORD_PUBLIC_KEY: string
  CONFIGS_KV: KVNamespace
}

export const configSchema = z.object({
  guildId: z.string(),
  channelId: z.string(),
  mode: z.enum(['DELETE_EACH_AFTER']),
  duration: z.number(),
})

export type ChannelConfig = z.infer<typeof configSchema>

export interface SlashCommand {
  builder: RESTPostAPIChatInputApplicationCommandsJSONBody
  handler: (
    appContext: AppContext,
    interaction: APIInteraction,
  ) => Promise<APIInteractionResponse>
}
