import { json } from 'https://deno.land/x/sift@0.6.0/mod.ts'
import {
  APIInteraction,
  APIInteractionResponse,
  InteractionType,
  InteractionResponseType,
  MessageFlags,
  APIChatInputApplicationCommandInteractionData,
} from 'discord.js'
import config from './config.ts'
import { appContext } from './context.ts'
import './cron.ts'
import { commands } from './commands.ts'

Deno.serve({ port: config.port }, handler)

async function handler(request: Request): Promise<Response> {
  const app = await appContext()

  const body = await request.text()
  const isValid = await app.discord.assertRequest(body, request.headers)
  if (!isValid) return new Response('Bad request signature', { status: 401 })

  const payload = JSON.parse(body) as APIInteraction

  if (payload.type === InteractionType.Ping) {
    return json({ type: InteractionResponseType.Pong })
  }

  if (payload.type === InteractionType.ApplicationCommand) {
    const data = payload.data as APIChatInputApplicationCommandInteractionData

    console.log('command data', data, payload.guild_id, payload.channel_id)

    if (commands.has(data.name)) {
      return json(await commands.get(data.name)!(app, payload))
    } else {
      return json({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'Unregistered command',
          flags: MessageFlags.Ephemeral,
        },
      })
    }
  }

  return new Response('Unknown interaction type', { status: 400 })
}
