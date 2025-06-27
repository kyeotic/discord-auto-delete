import { APIMessage, Routes } from 'discord.js'
import { appContext } from './context.ts'
import { runCleaner } from './commands/cleaner.ts'

// Run every hour
Deno.cron('delete-old-messages', '0 * * * *', cleanupCron)

export async function cleanupCron() {
  const app = await appContext()
  console.log('Running scheduled message deletion...')
  runCleaner(app)
}
