import { A } from '@solidjs/router'
import { PLAYERS, USER_PROFILE, UTIL } from './routes'
import classnames from 'classnames'

import { ThemeToggle } from '../components'
import { createSignal, For } from 'solid-js'

const navLinks = [
  { title: 'Players', href: PLAYERS, icon: 'fa-people-group' },
  // { title: 'Tags', href: TAGS, icon: 'fa-tag' },
  // { title: 'Teams', href: TEAMS, icon: 'fa-people-group' },
]

const navLinkClass = 'flex gap-2 justify-center items-center'
const navActiveClass = 'text-sky-800 dark:text-sky-300'

const menuLinkClass =
  'block py-2 px-3 border-b border-gray-100md:border-0 md:p-0 dark:border-gray-700'
const menuActiveClass = 'text-sky-400 dark:text-sky-300'

export default function NavBar() {
  const [isMenuOpen, setMenuOpen] = createSignal(false)
  function toggleMenu() {
    setMenuOpen(!isMenuOpen())
  }
  return (
    <nav
      class={`
      px-8 flex-none h-12
      flex gap-1 w-full justify-between items-center
      text-white drop-shadow-md
      bg-linear-to-r from-cyan-500 to-blue-500 py-1
    `}
    >
      <div class="flex gap-4 px-4">
        <A href="/" class={navLinkClass} activeClass={navActiveClass} end>
          <img
            class="flex-0 h-7 object-cover"
            src="/apple-touch-icon.png"
            alt="home"
          />
          <span class="flex-0 font-bold text-xl">Home</span>
        </A>
        <div class="hidden sm:flex gap-4">
          <For each={navLinks}>
            {(link) => (
              <A
                href={link.href}
                class={navLinkClass}
                activeClass={navActiveClass}
              >
                <i class={`fa-solid ${link.icon}`} />
                <span class="flex-0 font-bold text-xl">{link.title}</span>
              </A>
            )}
          </For>
        </div>
      </div>

      <div class="flex gap-4 items-center px-4">
        <ThemeToggle />
        <div class="hidden sm:block">
          <ProfileLink />
        </div>
        {/* <A href={UTIL}>
          <span class="flex-0 font-bold">Util</span>
        </A> */}

        <div class="flex sm:hidden">
          <button
            data-collapse-toggle="mega-menu"
            type="button"
            class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden focus:outline-hidden focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:focus:ring-gray-600"
            aria-controls="mega-menu"
            aria-expanded="false"
            onclick={toggleMenu}
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mega-menu"
        onclick={() => setMenuOpen(false)}
        class={classnames(
          'items-center justify-between w-full min-w-screen flex order-1 bg-green-700 sm:hidden',
          { hidden: !isMenuOpen() },
        )}
      >
        <ul class="flex flex-col font-medium mt-0 w-full">
          <For each={navLinks}>
            {(link) => (
              <li class="hover:bg-green-800">
                <A
                  href={link.href}
                  class={menuLinkClass}
                  activeClass={menuActiveClass}
                >
                  <i class={`fa-solid ${link.icon}`} />
                  <span class="flex-0 font-bold text-xl  pl-2">
                    {link.title}
                  </span>
                </A>
              </li>
            )}
          </For>
          <li>
            <ProfileLink isMenu />
          </li>
        </ul>
      </div>
    </nav>
  )
}

function ProfileLink(props: { isMenu?: boolean }): JSX.Element {
  return (
    <A
      href={USER_PROFILE}
      class={props.isMenu ? menuLinkClass : ''}
      activeClass={props.isMenu ? menuActiveClass : ''}
    >
      <i class="fa-solid fa-user pr-2 h-full" />
      <span
        class={classnames('flex-0 font-bold  pl-2', {
          'text-xl': props.isMenu,
        })}
      >
        Profile
      </span>
    </A>
  )
}
