import { verifyKey } from 'discord-interactions'
import {
  type APIInteraction,
  InteractionType,
  InteractionResponseType,
  MessageFlags,
  APIChatInputApplicationCommandInteractionData,
} from 'discord-api-types/v10'
import { createContext } from './context.ts'
import { cleanupCron } from './cron.ts'
import { commands } from './commands/mod.ts'
import type { WorkerEnv } from './types.ts'

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const app = createContext(env)

    const body = await request.text()
    const signature = request.headers.get('x-signature-ed25519')
    const timestamp = request.headers.get('x-signature-timestamp')

    if (!signature || !timestamp) {
      return new Response('Bad request signature', { status: 401 })
    }

    const isValid = await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY)
    if (!isValid) return new Response('Bad request signature', { status: 401 })

    const payload = JSON.parse(body) as APIInteraction

    if (payload.type === InteractionType.Ping) {
      return Response.json({ type: InteractionResponseType.Pong })
    }

    if (payload.type === InteractionType.ApplicationCommand) {
      const data = payload.data as APIChatInputApplicationCommandInteractionData
      console.log('command data', data, payload.guild_id, payload.channel_id)

      if (commands.has(data.name)) {
        return Response.json(await commands.get(data.name)!.handler(app, payload))
      } else {
        return Response.json({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: 'Unregistered command',
            flags: MessageFlags.Ephemeral,
          },
        })
      }
    }

    return new Response('Unknown interaction type', { status: 400 })
  },

  async scheduled(_event: ScheduledEvent, env: WorkerEnv): Promise<void> {
    const app = createContext(env)
    await cleanupCron(app)
  },
}
