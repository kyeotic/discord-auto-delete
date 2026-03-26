import { Routes } from 'discord-api-types/v10'
import { commands } from './commands/mod.ts'

const token = process.env['BOT_TOKEN']
if (!token) throw new Error('BOT_TOKEN env var is required')

console.log('Updating commands...')
const applicationId = getApplicationId(token)
await discordRequest('PUT', Routes.applicationCommands(applicationId), [
  ...commands.values(),
].map((c) => c.builder))
console.log('Commands updated.')

function getApplicationId(token: string): string {
  return Buffer.from(token.split('.')[0] ?? '', 'base64url').toString()
}

async function discordRequest(
  method: string,
  path: string,
  body: unknown,
): Promise<unknown> {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Discord API error ${res.status}: ${text}`)
  }
  return res.json()
}
