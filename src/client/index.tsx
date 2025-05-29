/* @refresh reload */
import './index.css'
import { render } from 'solid-js/web'
import { AuthProvider } from './auth/AuthProvider'

import App from './root/App'

render(
  () => (
    <AuthProvider>
      <App />
    </AuthProvider>
  ),
  document.getElementById('root') as HTMLElement,
)
