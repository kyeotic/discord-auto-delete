import { type JSX, type ParentProps } from 'solid-js'
import classnames from 'classnames'
import { bodyStyle } from '../Typography/font'

export default function Label(
  props: ParentProps & {
    id?: string
    class?: string
    for?: string
  },
): JSX.Element {
  return (
    <label
      for={props.id}
      class={classnames(
        'block mb-2 text-sm font-medium text-gray-900 dark:text-white',
        bodyStyle(),
        props.class,
      )}
    >
      {props.children}
    </label>
  )
}
