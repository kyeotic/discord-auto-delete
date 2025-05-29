import { DefaultColorPicker } from '@thednp/solid-color-picker'
import { JSX, mergeProps, Show, splitProps } from 'solid-js'

import '@thednp/solid-color-picker/style.css'
import { createFormControl, IFormControl } from 'solid-forms'
import Label from '../Label/Label'

export default function ColorPicker(
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    control?: IFormControl<string>
    label?: string
    labelClass?: string
  },
): JSX.Element {
  const [local, rest] = splitProps(
    mergeProps(
      {
        control: createFormControl(''),
      },
      props,
    ),
    ['control', 'class', 'label', 'labelClass', 'id'],
  )

  function onChange(color: string) {
    local.control.markTouched(true)
    local.control.setValue(color)
  }

  return (
    <div
      class="mb-2"
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
      <DefaultColorPicker
        format="hex"
        onChange={onChange}
        value={local.control.value}
        colorKeywords={[
          { default: 'rgb(37, 84, 189)' },
          { complementary: 'rgb(189, 142, 37)' },
        ]}
        colorPresets={{ hue: 0, hueSteps: 12, lightSteps: 10, saturation: 100 }}
      />
    </div>
  )
}
