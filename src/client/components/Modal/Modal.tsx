import { Show, type JSX, type ParentProps } from 'solid-js'
import { Portal } from 'solid-js/web'
import { bgStyle } from '../color'

export const MODAL_ROOT_ID = 'modal-root'

export default function Modal(
  props: ParentProps & { onClose?: () => void },
): JSX.Element {
  const root = document.getElementById(MODAL_ROOT_ID)
  if (!root) throw new Error(`Modal node "${MODAL_ROOT_ID}" is not in the DOM`)

  function close() {
    props.onClose?.()
  }

  function stopBubble(e: Event) {
    e.stopPropagation()
  }
  return (
    <Portal mount={root}>
      <div
        class="relative z-10"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="fixed inset-0 bg-gray-500/75 transition-opacity"
          aria-hidden="true"
        />

        <div
          class="fixed inset-0 z-10 w-screen overflow-y-auto"
          onclick={close}
        >
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              onclick={stopBubble}
              class={`relative transform rounded-lg ${bgStyle()} text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg`}
            >
              <Show when={props.onClose}>
                <div class="absolute top-0 right-0 pt-4 pr-4">
                  <i
                    class="fa-solid fa-x text-slate-500 cursor-pointer"
                    onclick={props.onClose}
                  />
                </div>
              </Show>
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export function ModalPanel(props: ParentProps): JSX.Element {
  return (
    <div class={`${bgStyle()} px-4 pb-4 pt-5 sm:p-6 sm:pb-4`}>
      {props.children}
      {/* <div class="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
      <div class="sm:flex sm:items-start">
          <svg
            class="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3
            class="text-base font-semibold leading-6 text-gray-900"
            id="modal-title"
          >
            Deactivate account
          </h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">
              Are you sure you want to deactivate your account? All of your data
              will be permanently removed. This action cannot be undone.
            </p>
          </div>
      </div>
        </div> */}
    </div>
  )
}

export function ModalButtons() {
  return (
    <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
      <button
        type="button"
        class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
      >
        Deactivate
      </button>
      <button
        type="button"
        class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
      >
        Cancel
      </button>
    </div>
  )
}
