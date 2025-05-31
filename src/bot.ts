// Use this file for the local bot debugging

// https://kyeotic-discord-cleaner.deno.dev/

import {
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
} from 'npm:discord.js'
import config from './config.ts'
import { commands } from './commands.ts'
import { appContext } from './context.ts'

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

const app = await appContext()

// {
//   id: "1378154187111661640",
//   name: "cleaner",
//   type: 1
//   options: [
//     {
//       name: "configure",
//       options: [ { name: "duration", type: 3, value: "2h" } ],
//       type: 1
//     }
//   ],
// }

client.on(Events.InteractionCreate, async (interaction) => {
  // console.log('interaction', interaction)
  // console.log('data', interaction.)
  if (interaction.isChatInputCommand()) {
    const s = interaction as ChatInputCommandInteraction
    const apiInteraction = {
      guild_id: interaction.guildId,
      channel: interaction.channel,
      channel_id: interaction.channelId,
      data: {
        id: interaction.commandId,
        name: interaction.commandName,
        type: interaction.commandType,
        options: [...s.options.data],
      },
    } as unknown as APIInteraction

    // console.log('apiInteraction', apiInteraction)
    const name = (
      apiInteraction.data as APIChatInputApplicationCommandInteractionData
    )?.name
    if (commands.has(name)) {
      const result = await commands.get(name)!(app, apiInteraction)
      // console.log('result', result)

      // parse the result and send it as a reply
      interaction.reply('Hello, world!')
    } else {
      interaction.reply('Unregistered command')
    }

    // console.log('isChatInputCommand', interaction.commandName)
  }
})

// Log in to Discord with your client's token
client.login(config.discord.token)
