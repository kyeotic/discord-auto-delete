import { Auth0Client } from '@auth0/auth0-spa-js'

import config from '../config'

export const auth0 = new Auth0Client({
  domain: config.auth0.domain,
  clientId: config.auth0.clientId,
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
  authorizationParams: {
    redirect_uri: config.auth0.redirectUrl,
    scope: config.auth0.scope,
  },
})
