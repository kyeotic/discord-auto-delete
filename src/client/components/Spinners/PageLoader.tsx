import { type JSX } from 'solid-js'
import SpinnerIcon from './SpinnerIcon'

export default function PageLoader(): JSX.Element {
  return (
    <div class="mt-8">
      <SpinnerIcon size="lg" />
    </div>
  )
}
