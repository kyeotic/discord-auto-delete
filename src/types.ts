import { z } from 'zod'
import {
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  APIInteractionResponse,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js'
import { AppContext } from './context.ts'

export const configSchema = z.object({
  guildId: z.string(),
  channelId: z.string(),
  mode: z.enum(['DELETE_EACH_AFTER']),
  duration: z.number(),
})

export type ChannelConfig = z.infer<typeof configSchema>

export interface SlashCommand {
  builder: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
  handler: (
    appContext: AppContext,
    interaction: APIInteraction,
  ) => Promise<APIInteractionResponse>
}
