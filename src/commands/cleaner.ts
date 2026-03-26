import {
  APIApplicationCommandInteractionDataSubcommandOption,
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  APIInteractionResponse,
  APIMessage,
  InteractionResponseType,
  MessageFlags,
  ApplicationCommandOptionType,
  Routes,
} from 'discord-api-types/v10'
import parseDuration from 'parse-duration'
import humanizeDuration from 'humanize-duration'
import { AppContext } from '../context.ts'
import {
  configSchema,
  type SlashCommand,
  type ChannelConfig,
} from '../types.ts'

export const cleanerCommand: SlashCommand = {
  builder: {
    name: 'cleaner',
    description: 'AutoDelete Cleaner configuration',
    options: [
      {
        name: 'view',
        description: 'View the current configuration for this channel',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'remove',
        description: 'Remove the cleaner from this channel',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'run',
        description: 'Run the cleaner configuration for this channel',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'configure',
        description: 'Configure the deletion duration',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'duration',
            description:
              "How long to wait before deleting messages (e.g., '1h', '3h', '24h', '2d')",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },
  handler: handleCleanerCommand,
}

export async function handleCleanerCommand(
  appContext: AppContext,
  interaction: APIInteraction,
): Promise<APIInteractionResponse> {
  const data = interaction.data as APIChatInputApplicationCommandInteractionData

  console.log('data', data)
  const command = data.options?.[0]?.name

  if (command === 'run') {
    const config = await appContext.stores.configs.get(
      interaction.guild_id!,
      interaction.channel?.id!,
    )
    if (!config) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'No configuration found for this channel',
          flags: MessageFlags.Ephemeral,
        },
      }
    }
    await cleanChannel(appContext, config)

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Cleaner has been run',
        flags: MessageFlags.Ephemeral,
      },
    }
  }

  if (command === 'configure') {
    const duration = (
      data.options?.[0] as APIApplicationCommandInteractionDataSubcommandOption
    )?.options?.[0]?.value

    if (!duration) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'Invalid duration',
          flags: MessageFlags.Ephemeral,
        },
      }
    }

    const durationMs = parseDuration(duration as string)
    console.log('durationMs', durationMs)

    if (!durationMs) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'Invalid duration',
          flags: MessageFlags.Ephemeral,
        },
      }
    }

    const channelConfig = configSchema.parse({
      guildId: interaction.guild_id,
      channelId: interaction.channel?.id,
      mode: configSchema.shape.mode.enum.DELETE_EACH_AFTER,
      duration: durationMs,
    })

    await appContext.stores.configs.set(channelConfig)

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `Configuration set to ${humanizeDuration(durationMs)}`,
        flags: MessageFlags.Ephemeral,
      },
    }
  }

  if (command === 'view') {
    const channelConfig = await appContext.stores.configs.get(
      interaction.guild_id!,
      interaction.channel?.id!,
    )

    if (!channelConfig) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'No configuration found',
          flags: MessageFlags.Ephemeral,
        },
      }
    }

    console.log('channelConfig', channelConfig)

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        flags: MessageFlags.Ephemeral,
        content: `Current configuration: ${humanizeDuration(
          channelConfig.duration,
        )}`,
      },
    }
  }

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: 'Hello, world!',
      flags: MessageFlags.Ephemeral,
    },
  }
}

export async function runCleaner(appContext: AppContext): Promise<void> {
  const configs = await appContext.stores.configs.getAll()

  for (const config of configs) {
    await cleanChannel(appContext, config)
  }
}

async function cleanChannel(app: AppContext, config: ChannelConfig) {
  const messages = (await app.discordRequest(
    'GET',
    Routes.channelMessages(config.channelId),
  )) as APIMessage[]
  const messagesToDelete = messages.filter((message) => {
    if (message.pinned) return false
    const createdAt = new Date(message.timestamp)
    const now = new Date()
    const diff = now.getTime() - createdAt.getTime()
    return diff > config.duration
  })
  console.log(config.channelId, messagesToDelete.length)
  if (!messagesToDelete.length) return

  if (messagesToDelete.length === 1) {
    await app.discordRequest(
      'DELETE',
      Routes.channelMessage(config.channelId, messagesToDelete[0]!.id),
    )
  } else {
    await app.discordRequest(
      'POST',
      Routes.channelBulkDelete(config.channelId),
      { messages: messagesToDelete.map((message) => message.id) },
    )
  }
}
