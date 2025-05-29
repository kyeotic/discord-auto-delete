import { A } from '@solidjs/router'

export default function Footer() {
  return (
    <footer class="flex gap-1 h-8 w-full justify-center items-center text-white bg-black pb-4 box-content">
      <A class="contents" href="/util">
        Utilities
      </A>
    </footer>
  )
}
