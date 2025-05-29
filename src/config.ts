const envPort = Deno.env.get('PORT')
const isDenoDeploy = !!Deno.env.get('DENO_DEPLOYMENT_ID')

const port = envPort ? parseFloat(envPort) : 8080

export default {
  isDenoDeploy,
  port,
} as const
