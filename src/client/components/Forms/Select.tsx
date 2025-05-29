import { createFormControl, IFormControl } from 'solid-forms'
import { createSignal, JSX, mergeProps, Show, splitProps } from 'solid-js'
import { Select as LibSelect, createOptions } from '@thisbeyond/solid-select'

import '@thisbeyond/solid-select/style.css'
import Label from '../Label/Label'

export type SelectOption = { id: string; label: string }

export default function Select(
  props: JSX.InputHTMLAttributes<HTMLInputElement> & {
    control?: IFormControl<string | null>
    options: Array<SelectOption>
    label?: string
    labelClass?: string
  },
): JSX.Element {
  let [local, rest] = splitProps(
    mergeProps(
      {
        control: createFormControl<string | null>(null),
        type: 'text',
        multiple: false,
      },
      props,
    ),
    ['control', 'class', 'label', 'labelClass', 'type', 'id', 'multiple'],
  )

  const [selectedValue, setSelectedValue] = createSignal<SelectOption | null>(
    local.control.value
      ? (props.options.find((o) => o.id === local.control.value) ?? null)
      : null,
  )

  const selectProps = createOptions(() => props.options, {
    // key: 'name',
    format: (item: SelectOption, type) => {
      // console.log('formatting', type, item)
      return item?.label ?? ''
      // return type === 'value' ? item.label : item.label
      // return item.label
    },
  })

  function onChange(option: SelectOption | null) {
    local.control.setValue(option?.id ?? null)
    setSelectedValue(option)
  }

  return (
    <div>
      <Show when={props.label}>
        <Label>{props.label}</Label>
      </Show>
      <LibSelect
        onChange={onChange}
        multiple={false}
        initialValue={selectedValue()}
        {...selectProps}
      />
    </div>
  )
}
