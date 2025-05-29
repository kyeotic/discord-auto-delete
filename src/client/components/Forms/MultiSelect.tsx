import { createFormControl, IFormControl } from 'solid-forms'
import { createSignal, JSX, mergeProps, Show, splitProps } from 'solid-js'
import { Select as LibSelect, createOptions } from '@thisbeyond/solid-select'

import '@thisbeyond/solid-select/style.css'
import Label from '../Label/Label'

export type SelectOption = { id: string; label: string }

export default function Select(
  props: JSX.InputHTMLAttributes<HTMLInputElement> & {
    control?: IFormControl<string[]>
    options: Array<SelectOption>
    multiple?: boolean
    label?: string
    labelClass?: string
  },
): JSX.Element {
  let [local, rest] = splitProps(
    mergeProps(
      {
        control: createFormControl<string[]>([]),
      },
      props,
    ),
    ['control', 'class', 'label', 'labelClass', 'type', 'id'],
  )
  const [selectedValues, setSelectedValues] = createSignal<SelectOption[]>(
    local.control.value
      .map((id) => props.options.find((o) => o.id === id))
      .filter((o) => o !== undefined),
  )

  const selectProps = createOptions(() => props.options, {
    // extractText: (value: SelectOption) => {
    //   console.log('extracting text', value)
    //   return value.label
    // },
    // key: 'name',
    format: (item: SelectOption, type) => {
      // console.log('formatting', type, item)
      return item?.label ?? ''
      // return type === 'value' ? item.label : item.label
      // return item.label
    },
  })

  function onChange(options: SelectOption[]) {
    // console.log('multi selecting', options)
    local.control.setValue(options.map((o) => o.id))
    setSelectedValues(options)
  }

  return (
    <div>
      <Show when={props.label}>
        <Label>{props.label}</Label>
      </Show>
      <LibSelect
        onChange={onChange}
        // options={props.options}
        multiple={true}
        initialValue={selectedValues()}
        // format={format}
        {...selectProps}
      />
    </div>
  )
}
