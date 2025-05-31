import { appContext } from './context.ts'

// Run every hour
Deno.cron('delete-old-messages', '0 * * * *', cleanupCron)

export async function cleanupCron() {
  const app = await appContext()
  console.log('Running scheduled message deletion...')
  const configs = await app.stores.configs.getAll()

  for (const config of configs) {
    const messages = await app.discord.getChannelMessages(config.channelId)
    const messagesToDelete = messages.filter((message) => {
      if (message.pinned) return false
      const createdAt = new Date(message.timestamp)
      const now = new Date()
      const diff = now.getTime() - createdAt.getTime()
      return diff > config.duration
    })
    await app.discord.deleteMessages(
      config.channelId,
      messagesToDelete.map((message) => message.id),
    )
  }
}
