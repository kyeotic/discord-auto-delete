const envPort = Deno.env.get('PORT')
const isDenoDeploy = !!Deno.env.get('DENO_DEPLOYMENT_ID')

const port = envPort ? parseFloat(envPort) : 8080

export default {
  isDenoDeploy,
  port,
  distDir: '../../dist',
  auth: {
    audience: 'kyeotek',
    issuer: 'https://kyeotek-auth0.kye.dev/',
    algorithms: ['RS256'],
  },
  webpush: {
    adminEmail: 'tim@kye.dev',
    keysBase64: Deno.env.get('WEBPUSH_KEYS_BASE64')!,
  },
} as const
