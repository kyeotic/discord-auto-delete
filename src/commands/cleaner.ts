import {
  APIApplicationCommandInteractionDataSubcommandOption,
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  APIInteractionResponse,
  APIMessage,
  InteractionResponseType,
  MessageFlags,
  SlashCommandBuilder,
  Routes,
} from 'npm:discord.js'
import parseDuration from 'npm:parse-duration'
import humanizeDuration from 'npm:humanize-duration'
import { AppContext } from '../context.ts'
import {
  configSchema,
  type SlashCommand,
  type ChannelConfig,
} from '../types.ts'
// {
//   id: "1378154187111661640",
//   name: "cleaner",
//   options: [
//     {
//       name: "configure",
//       options: [ { name: "duration", type: 3, value: "2h" } ],
//       type: 1
//     }
//   ],
//   type: 1
// }

export const cleanerCommand: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('cleaner')
    .setDescription('AutoDelete Cleaner configuration')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('View the current configuration for this channel'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove the cleaner from this channel'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('run')
        .setDescription('Run the cleaner configuration for this channel'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('configure')
        .setDescription('Configure the deletion duration')
        .addStringOption((option) =>
          option
            .setName('duration')
            .setDescription(
              "How long to wait before deleting messages (e.g., '1h', '3h', '24h', '2d')",
            )
            .setRequired(true),
        ),
    ),
  handler: handleCleanerCommand,
}

export async function handleCleanerCommand(
  appContext: AppContext,
  interaction: APIInteraction,
): Promise<APIInteractionResponse> {
  // console.log('com', cleanerCommand.builder.toJSON())
  const data = interaction.data as APIChatInputApplicationCommandInteractionData

  // console.log('interaction', interaction)
  console.log('data', data)
  const command = data.options?.[0]?.name
  // console.log('command', command, command === 'view')

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
  const messages = (await app.discord.get(
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
    await app.discord.delete(
      Routes.channelMessage(config.channelId, messagesToDelete[0].id),
    )
  } else {
    await app.discord.post(Routes.channelBulkDelete(config.channelId), {
      body: { messages: messagesToDelete.map((message) => message.id) },
    })
  }
}

// {
//   id: "1378160453984981034",
//   name: "cleaner",
//   options: [
//     {
//       name: "configure",
//       type: 1,
//       options: [ { name: "duration", type: 3, value: "2f" } ]
//     }
//   ],
//   type: 1
// }
