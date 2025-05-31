import { verifyKey } from 'discord-interactions'
import { type APIMessage } from 'discord-api-types/v10'
import { REST, Routes } from 'discord.js'

export default class Discord {
  private readonly rest: REST

  constructor(
    private readonly token: string,
    private readonly publicKey: string,
    private readonly version: string,
  ) {
    this.rest = new REST({ version: this.version }).setToken(this.token)
  }

  async assertRequest(body: string, headers: Headers): Promise<boolean> {
    const signature = headers.get('x-signature-ed25519')
    const timestamp = headers.get('x-signature-timestamp')

    if (!signature || !timestamp) {
      return false
    }

    return await verifyKey(body, signature, timestamp, this.publicKey)
  }

  async getChannelMessages(
    channelId: string,
    options?: { before?: string; after?: string },
  ): Promise<APIMessage[]> {
    const response = await this.rest.get(Routes.channelMessages(channelId), {
      query: asQuery(options),
    })
    return response as APIMessage[]
  }

  async deleteMessages(channelId: string, messageIds: string[]) {
    if (messageIds.length === 0) return
    await this.rest.post(Routes.channelBulkDelete(channelId), {
      body: { messages: messageIds },
    })
  }
}

function asQuery(
  options?: Record<string, string | undefined>,
): URLSearchParams | undefined {
  if (!options) return undefined

  const filtered = Object.fromEntries(
    Object.entries(options).filter(([_, value]) => value !== undefined),
  ) as Record<string, string>

  const keys = Object.keys(filtered as Record<string, string>)
  return keys.length > 0 ? new URLSearchParams(filtered) : undefined
}
