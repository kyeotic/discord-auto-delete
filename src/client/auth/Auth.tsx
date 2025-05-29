import { type JSX, Match, type ParentProps, Switch } from 'solid-js'
import { useAuth } from './AuthProvider.tsx'

import Login from './Login.tsx'
import { PageLoader } from '../components/index.ts'
import { StoresProvider } from '../data/stores.tsx'
import { TrpcProvider } from '../data/trpc.tsx'

export default function Auth(props: ParentProps): JSX.Element {
  const { store, init } = useAuth()

  init().catch((err) => console.error('init fail', err))

  return (
    <>
      <Switch>
        <Match when={!store.hasInitialized}>
          <PageLoader />
        </Match>
        <Match when={store.hasInitialized && !store.token}>
          <Login />
        </Match>
        <Match when={store.hasInitialized && store.token}>
          {props.children}
        </Match>
      </Switch>
    </>
  )
}
