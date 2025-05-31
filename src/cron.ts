import { APIMessage, Routes } from 'discord.js'
import { appContext } from './context.ts'

// Run every hour
Deno.cron('delete-old-messages', '0 * * * *', cleanupCron)

export async function cleanupCron() {
  const app = await appContext()
  console.log('Running scheduled message deletion...')
  const configs = await app.stores.configs.getAll()

  for (const config of configs) {
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
    if (!messagesToDelete.length) continue

    await app.discord.post(Routes.channelBulkDelete(config.channelId), {
      body: { messages: messagesToDelete.map((message) => message.id) },
    })
  }
}
