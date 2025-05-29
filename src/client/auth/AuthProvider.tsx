import { createContext, type JSX, type ParentProps, useContext } from 'solid-js'
import {
  type Auth0Client,
  GetTokenSilentlyOptions,
  type User,
} from '@auth0/auth0-spa-js'
import { createStore } from 'solid-js/store'
import { auth0 } from './auth0'
import config from '../config'

export type AuthUser = User

interface AuthStore {
  hasInitialized: boolean
  user: AuthUser | null
  token: string | null
}

interface AuthContextProps {
  store: AuthStore
  init: () => Promise<void>
  login: () => void
  logout: () => void
}

const authConfig: GetTokenSilentlyOptions = {
  authorizationParams: {
    audience: config.auth0.audience,
    scope: config.auth0.scope,
  },
}

export const AuthContext = createContext<AuthContextProps>()

export function AuthProvider(
  props: ParentProps<{
    client?: Auth0Client
  }>,
): JSX.Element {
  const [store, setStore] = createStore<AuthStore>({
    hasInitialized: false,
    user: null,
    token: null,
  })

  const client = props.client || auth0

  async function init() {
    // console.log('auth', store.hasInitialized)
    if (store.hasInitialized) return

    const params = new URLSearchParams(window.location.search)

    if (params.has('code')) {
      // console.log('trying redirect handle')
      const redirectResult = await auth0.handleRedirectCallback()
      // console.log('redirect', redirectResult)
      stripAuthRedirectParams()
    }

    try {
      const token = await client.getTokenSilently(authConfig)
      // console.log('auth done', store.hasInitialized, token)
      setStore({ token })
    } catch (error: any) {
      setStore({ hasInitialized: true })
      if (
        error.error !== 'login_required' &&
        error.error !== 'missing_refresh_token'
      ) {
        console.log('auth error', error.error, error)
        // return client.loginWithRedirect()
        throw error
      }
    }

    const user = await client.getUser()
    setStore({ hasInitialized: true, user })
  }

  const result = {
    store,
    init,
    login: () => client.loginWithRedirect(authConfig),
    logout: () => {
      client.logout({ logoutParams: { returnTo: config.auth0.redirectUrl } })
      setStore({ user: null, token: null })
    },
  }

  return (
    <AuthContext.Provider value={result}>{props.children}</AuthContext.Provider>
  )
}

export function useAuth(): AuthContextProps {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within a AuthUserContext.Provider')
  }

  return ctx
}

function stripAuthRedirectParams() {
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)

  params.delete('code')
  params.delete('state')
  url.search = params.toString()

  window.history.replaceState(null, '', url.toString())
}
