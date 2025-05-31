import { handleCleanerCommand } from './commands/cleaner.ts'
import { SlashCommand } from './types.ts'

const commands = new Map<string, SlashCommand['handler']>()

commands.set('cleaner', handleCleanerCommand)

export { commands }
