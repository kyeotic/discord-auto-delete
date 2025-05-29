import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

import UserStore from './users/userStore.ts'
import PlayerStore from './players/playerStore.ts'
import { lazy } from './util/lazy.ts'

export interface InnerContext {
  stores: {
    users: UserStore
    players: PlayerStore
  }
}

// Only one context per app is needed, make sure we only ever make one
const appContext = lazy(createContext)

export async function createContext(): Promise<InnerContext> {
  const kv = await Deno.openKv()
  return {
    stores: {
      users: new UserStore(kv),
      players: new PlayerStore(kv),
    },
  } as InnerContext
}

export async function createAppContext(opts: FetchCreateContextFnOptions) {
  const inner = await appContext()

  return {
    ...inner,
    req: opts.req,
  }
}

export type Context = Awaited<ReturnType<typeof createAppContext>>
