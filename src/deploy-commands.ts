import base64Url from 'base64url'
import { Routes } from 'discord.js'
import { appContext } from './context.ts'
import { commands } from './commands/mod.ts'

const app = await appContext()
const rest = app.discord

console.log('Updating commands...')
await rest.put(Routes.applicationCommands(getApplicationId()), {
  body: [...commands.values()].map((command) => command.builder.toJSON()),
})

// if (app.config.discord.guildId) {
//   console.log('Updating guild commands...')
//   await rest.put(
//     Routes.applicationGuildCommands(
//       getApplicationId(),
//       app.config.discord.guildId,
//     ),
//     {
//       body: commands,
//     },
//   )
// }

// remove discord guild commands
// console.log('Removing guild commands...')
// await rest.put(
//   Routes.applicationGuildCommands(
//     getApplicationId(),
//     app.config.discord.guildId!,
//   ),
//   {
//     body: [],
//   },
// )

function getApplicationId() {
  const token = app.config.discord.token
  return base64Url.default.decode(token?.split('.')[0] || '') || ''
}
