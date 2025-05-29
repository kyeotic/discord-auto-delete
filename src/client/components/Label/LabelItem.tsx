import { type JSX, type ParentProps } from 'solid-js'
import classnames from 'classnames'

export default function LabelItem(
  props: ParentProps & {
    label: string
    labelClass?: string
    textClass?: string
    inline?: boolean
  },
): JSX.Element {
  return (
    <div>
      <label
        class={classnames(
          'text-gray-700 text-sm font-bold mb-2',
          (props.inline ?? false) ? 'mr-2' : 'block',
          props.labelClass,
        )}
      >
        {props.label}
      </label>
      <span class={props.textClass}>{props.children}</span>
    </div>
  )
}
