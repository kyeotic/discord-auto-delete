import { initTRPC, TRPCError } from '@trpc/server'
import { createJwtVerifier } from '@kyeotic/server'
import superjson from 'superjson'

import { Context } from './context.ts'
import config from './config.ts'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

const verifyJwt = createJwtVerifier({
  issuer: config.auth.issuer,
  audience: config.auth.audience,
})

export const router = t.router
export const publicProcedure = t.procedure

export const authProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts
  try {
    const authHeader = ctx.req.headers.get('authorization')
    if (!authHeader) throw new Error('authorization required')

    const token = await verifyJwt(authHeader)
    const user = await ctx.stores.users.initUser(token)

    return opts.next({
      ctx: {
        auth: token,
        user: user,
      },
    })
  } catch (e: unknown) {
    console.error('auth error', e)
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
})
