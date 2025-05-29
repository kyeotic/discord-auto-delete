import { createTRPCClient, httpLink } from '@trpc/client'
import type { AppRouter } from '../../server/server.ts'
import config from '../config.ts'
import { requiredContext } from '../util/context.tsx'
import { ParentProps } from 'solid-js'
import { useAuth } from '../auth/AuthProvider.tsx'
import urlJoin from 'url-join'
import superjson from 'superjson'

export type TrpcAppClient = ReturnType<typeof createTRPCClient<AppRouter>>

export function initTrpc(token: string): TrpcAppClient {
  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: urlJoin(config.apiUrl + '/api'),
        headers() {
          return {
            Authorization: `Bearer ${token}`,
          }
        },
        transformer: superjson,
      }),
    ],
  })
}

const { use: useTrpc, Provider: TrpcProvider } = requiredContext<
  TrpcAppClient,
  ParentProps
>('TrpcClient', () => {
  const {
    store: { token },
  } = useAuth()
  if (!token) throw new Error('no login token, unable to init ApisProvider')

  return initTrpc(token)
})

export { TrpcProvider, useTrpc }
