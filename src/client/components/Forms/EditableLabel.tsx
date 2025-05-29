import {
  Show,
  mergeProps,
  splitProps,
  For,
  type JSX,
  createSignal,
  Switch,
  Match,
  createEffect,
} from 'solid-js'
import { createFormControl, type IFormControl } from 'solid-forms'

import Label from '../Label/Label'
import TextInput from './TextInput'
import IconButton from '../Button/IconButton'
import { Text, Link } from '../Typography/Text'

export default function EditableLabel(
  props: JSX.InputHTMLAttributes<HTMLInputElement> & {
    control?: IFormControl<string>
    label?: string
    labelClass?: string
    onUpdate?: (val: string) => void
  },
): JSX.Element {
  // here we provide a default form control in case the user doesn't supply one

  const [local, rest] = splitProps(
    mergeProps({ control: createFormControl(''), type: 'text' }, props),
    ['control', 'class', 'label', 'labelClass', 'type', 'id'],
  )

  const [isEditing, setEditing] = createSignal(false)
  function toggleEditing() {
    setEditing(!isEditing())
  }

  createEffect(() => {
    const newValue = local.control.value
    // console.log('updating editable', newValue)
    props.onUpdate?.(newValue)
  })

  return (
    <div
      class="mb-2"
      classList={{
        'is-invalid': !!local.control.errors,
        'is-touched': local.control.isTouched,
        'is-required': local.control.isRequired,
      }}
    >
      <Label>Url</Label>
      <div class="flex min-w-3xs font-white">
        <Switch>
          <Match when={isEditing()}>
            <TextInput containerClass="flex-1" control={local.control} />
          </Match>
          <Match when={!isEditing() && local.control.value}>
            <Link href={local.control.value}>{local.control.value}</Link>
          </Match>
          <Match when={!isEditing() && !local.control.value}>
            <Text>None</Text>
          </Match>
        </Switch>
        <IconButton
          icon="fa-solid fa-edit flex-none ml-2"
          small
          onclick={toggleEditing}
        />
      </div>
    </div>
  )
}
