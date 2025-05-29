import { Show, mergeProps, splitProps, For, type JSX } from 'solid-js'
import { createFormControl, type IFormControl } from 'solid-forms'

import Label from '../Label/Label'
import { default as Input } from '../TextInput/TextInput'
import classnames from 'classnames'

export default function TextInput(
  props: JSX.InputHTMLAttributes<HTMLInputElement> & {
    control?: IFormControl<string>
    label?: string
    labelClass?: string
    containerClass?: string
  },
): JSX.Element {
  // here we provide a default form control in case the user doesn't supply one

  let [local, rest] = splitProps(
    mergeProps({ control: createFormControl(''), type: 'text' }, props),
    ['control', 'class', 'label', 'labelClass', 'type', 'id'],
  )

  return (
    <div
      class={classnames('mb-2', props.containerClass ?? '')}
      classList={{
        'is-invalid': !!local.control.errors,
        'is-touched': local.control.isTouched,
        'is-required': local.control.isRequired,
      }}
    >
      <Show when={local.label}>
        <Label for={local.id} class={local.labelClass}>
          {local.label}
        </Label>
      </Show>
      <Input
        {...rest}
        id={local.id}
        type={local.type}
        value={local.control.value}
        oninput={(e) => {
          local.control.setValue(e.currentTarget.value)
        }}
        onblur={() => local.control.markTouched(true)}
        required={local.control.isRequired}
        class={local.class}
      />
      <Show when={local.control.isTouched && !local.control.isValid}>
        <For each={Object.values(local.control.errors!)}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  )
}
