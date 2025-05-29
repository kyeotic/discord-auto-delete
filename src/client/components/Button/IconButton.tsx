import { type JSX, mergeProps, splitProps } from 'solid-js'
import classnames from 'classnames'

interface IconButtonProps {
  icon: string
  small?: boolean
}

export function iconButtonStyle(
  props: IconButtonProps,
  ...classes: string[]
): string {
  return classnames(
    'text-slate-700 font-bold rounded-sm inline-block cursor-pointer touch-manipulation',
    'hover:bg-slate-700 hover:text-white',
    props.small ? 'py-1 px-2' : 'py-2 px-4',
    ...classes,
  )
}

export default function IconButton(
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & IconButtonProps,
): JSX.Element {
  let [local, rest] = splitProps(
    mergeProps(
      { type: 'button' as JSX.ButtonHTMLAttributes<HTMLButtonElement>['type'] },
      props,
    ),
    ['class', 'icon', 'small'],
  )
  return (
    <button {...rest} class={classnames(local.class, iconButtonStyle(local))}>
      <i class={local.icon} />
    </button>
  )
}
