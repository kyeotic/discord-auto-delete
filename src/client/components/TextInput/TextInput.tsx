import { Show, splitProps } from 'solid-js'
import classnames from 'classnames'

import Label from '../Label/Label'

import type { JSX } from 'solid-js'

export default function TextInput(
  props: JSX.InputHTMLAttributes<HTMLInputElement> & {
    label?: string
    labelClass?: string
  },
) {
  let [local, rest] = splitProps(props, [
    'class',
    'label',
    'labelClass',
    'type',
    'id',
  ])
  return (
    <div>
      <Show when={local.label}>
        <Label for={local.id} class={local.labelClass}>
          {local.label}
        </Label>
      </Show>
      <input
        {...rest}
        id={local.id}
        type={local.type ?? 'text'}
        class={classnames(
          local.class,
          // 'shadow-sm appearance-none border rounded-sm w-full py-2 px-3 leading-tight focus:outline-hidden focus:shadow-outline',
          'bg-gray-50 dark:bg-gray-700 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
        )}
      />
    </div>
  )
}
