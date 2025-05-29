import { JSX } from 'solid-js'
import { Text } from './Typography/Text'

type InputEvent = JSX.ChangeEventHandler<HTMLInputElement, Event>
type InputEventParam = Parameters<InputEvent>[0]

export default function Toggle(props: {
  isChecked: boolean
  label?: string
  onChange?: (val: boolean) => void
}): JSX.Element {
  function onChange(e: InputEventParam) {
    e.preventDefault()
    props.onChange?.(e.target.checked)
  }
  return (
    <label class="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value=""
        checked={props.isChecked}
        class="sr-only peer"
        onChange={onChange}
      />
      <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
      <Text class="ms-3 text-sm font-medium">{props.label}</Text>
    </label>
  )
}
