import { JSX } from 'solid-js'
import { useAuth } from './AuthProvider'
import { Button, H1 } from '../components'

export default function Login(): JSX.Element {
  const { login } = useAuth()

  // login()

  // return null

  return (
    <div class="w-full h-full flex flex place-content-center">
      <div class="flex flex-col place-content-center">
        <H1 class="flex-initial">Login Required</H1>
        <Button onclick={() => login()} class="flex-initial" primary>
          Login
        </Button>
      </div>
    </div>
  )
}
