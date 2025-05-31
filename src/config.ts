const envPort = Deno.env.get('PORT')
const isDenoDeploy = !!Deno.env.get('DENO_DEPLOYMENT_ID')

const port = envPort ? parseFloat(envPort) : 8080

export default {
  isDenoDeploy,
  port,
  discord: {
    version: '10',
    token: Deno.env.get('BOT_TOKEN')!,
    publicKey: Deno.env.get('DISCORD_PUBLIC_KEY')!,
    guildId: Deno.env.get('DISCORD_GUILD_ID'),
    // guildId: undefined,
  },
  kv: {
    // targetUrl: undefined,
    targetUrl: isDenoDeploy ? undefined : Deno.env.get('KV_TARGET_URL'),
  },
} as const
