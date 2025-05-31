import config from './config.ts'
import { REST, Routes } from 'discord.js'
import { cleanupCron } from './cron.ts'

await cleanupCron()

// const discord = new Discord(
//   config.discord.token,
//   config.discord.publicKey,
//   config.discord.version,
// )

// const messages = await discord.getChannelMessages('1376610136541630485')

// console.log(messages)

// const oldMessages = messages
//   .filter(
//     (message) =>
//       new Date(message.timestamp) < new Date('2025-05-28T00:00:00.000Z'),
//   )
//   .filter((m) => !m.pinned)

// console.log(oldMessages.map((m) => m.id))

// await discord.deleteMessages(
//   '1376610136541630485',
//   oldMessages.map((m) => m.id),
// )

// const rest = new REST({ version: '10' }).setToken(config.discord.token)

// const response = await rest.get(Routes.channelMessages('1376610136541630485'))

// console.log(response)
