import config from './config.ts'

Deno.serve({ port: config.port }, handler)

async function handler(request: Request) {
  return new Response('Hello, world!')
}
