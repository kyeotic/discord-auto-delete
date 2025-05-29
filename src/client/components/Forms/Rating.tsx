import { createFormControl, IFormControl } from 'solid-forms'
import { createEffect, For, JSX, mergeProps, Show, splitProps } from 'solid-js'
import Label from '../Label/Label'
import Rating from '../Rating'
let ratingId = 1

export default function RatingControl(props: {
  control?: IFormControl<number>
  label?: string
  onChange?: (val: number) => void
}): JSX.Element {
  // here we provide a default form control in case the user doesn't supply one

  let [local, rest] = splitProps(
    mergeProps(
      { control: createFormControl(0), type: 'text', id: `rr-${ratingId++}` },
      props,
    ),
    ['control', 'label', 'type', 'id'],
  )

  // createEffect(() => {
  //   props.onChange?.(local.control.value)
  // })

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
        <Label for={local.id}>{local.label}</Label>
      </Show>
      <Rating
        value={local.control.value}
        onChange={(value) => local.control.setValue(value)}
      />

      <Show when={local.control.isTouched && !local.control.isValid}>
        <For each={Object.values(local.control.errors!)}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  )
}
