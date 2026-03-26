import { AppContext } from './context.ts'
import { runCleaner } from './commands/cleaner.ts'

export async function cleanupCron(app: AppContext): Promise<void> {
  console.log('Running scheduled message deletion...')
  await runCleaner(app)
}
