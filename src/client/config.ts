const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN as string
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string

const origin = window.location.origin

export default {
  apiUrl:
    origin.includes('localhost') || origin.includes('http://127.0.0.1')
      ? 'http://localhost:8080'
      : origin,
  auth0: {
    domain: auth0Domain,
    clientId: auth0ClientId,
    audience: 'kyeotek',
    scope: 'openid profile email offline_access',
    redirectUrl: `${window.location.protocol}//${window.location.host}`,
  },
} as const
