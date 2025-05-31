import { cleanerCommand } from './cleaner.ts'
import { SlashCommand } from '../types.ts'

const commands = new Map<string, SlashCommand>()

commands.set('cleaner', cleanerCommand)

export { commands }
