import base64Url from 'base64url'
import { REST, Routes } from 'discord.js'
import { cleanerCommand } from './commands/cleaner.ts'
import { appContext } from './context.ts'

const app = await appContext()
const rest = (app.discord as any).rest as REST

const commands = [cleanerCommand]

console.log('Updating commands...')
await rest.put(Routes.applicationCommands(getApplicationId()), {
  body: commands,
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
console.log('Removing guild commands...')
await rest.put(
  Routes.applicationGuildCommands(
    getApplicationId(),
    app.config.discord.guildId!,
  ),
  {
    body: [],
  },
)

function getApplicationId() {
  const token = app.config.discord.token
  return base64Url.default.decode(token?.split('.')[0] || '') || ''
}
