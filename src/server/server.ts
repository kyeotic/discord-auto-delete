import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { serveStatic, withCors, joinDir } from '@kyeotic/server'

import { router } from './trpc.ts'
import { createAppContext } from './context.ts'
import config from './config.ts'

import { playerRouter } from './players/routes.ts'

const staticDir = joinDir(import.meta.url, config.distDir)

const appRouter = router({
  players: playerRouter,
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter

Deno.serve({ port: config.port }, handler)

async function handler(request: Request) {
  const url = new URL(request.url)
  // Only used for start-server-and-test package that
  // expects a 200 OK to start testing the server
  if (request.method === 'HEAD') {
    return new Response()
  }

  if (url.pathname.startsWith('/api')) {
    // Only allow CORS in development
    if (request.method === 'OPTIONS' && !config.isDenoDeploy) {
      return withCors(request, new Response())
    }
    const response = await fetchRequestHandler({
      endpoint: '/api',
      req: request,
      router: appRouter,
      createContext: createAppContext,
    })

    if (!config.isDenoDeploy) return withCors(request, response)
    return response
  } else {
    return serveStatic(request, { rootDir: staticDir })
  }
}
