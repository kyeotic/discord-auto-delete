import { ErrorBoundary, JSX, onMount, ParentProps } from 'solid-js'
import { MODAL_ROOT_ID } from '../components/Modal/Modal'
import { useNavigate } from '@solidjs/router'
import { Toaster } from 'solid-toast'

import NavBar from './NavBar'
import Auth from '../auth/Auth'
import { Routes } from './routes'
import { StoresProvider, useStores } from '../data/stores'
import { TrpcProvider } from '../data/trpc'

export default function Root() {
  return <Routes root={App} />
}

export function App(props: ParentProps) {
  return (
    <ErrorBoundary fallback={(err) => err}>
      <div class="w-full flex flex-col min-h-screen max-h-screen">
        <NavBar />
        <main class="w-full max-h-full p-4 grow overflow-scroll flex flex-col">
          <Auth>
            <TrpcProvider>
              <StoresProvider>
                <Init />
                {props.children}
              </StoresProvider>
            </TrpcProvider>
          </Auth>
        </main>
        {/* <Footer /> */}
        <Toaster position="bottom-right" />
        <div id={MODAL_ROOT_ID} />
      </div>
    </ErrorBoundary>
  )
}

function Init(): JSX.Element {
  return null
}
