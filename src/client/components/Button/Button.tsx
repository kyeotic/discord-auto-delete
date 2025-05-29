import { type JSX, mergeProps, splitProps } from 'solid-js'
import classnames from 'classnames'

interface ButtonProps {
  primary?: boolean
  danger?: boolean
  small?: boolean
}

export function buttonStyle(
  props: ButtonProps = {
    primary: false,
    danger: false,
    small: false,
  },
  ...classes: string[]
): string {
  return classnames(
    'text-white font-bold rounded-sm inline-block touch-manipulation',
    props.small ? 'py-1 px-2' : 'py-2 px-4',
    props.danger
      ? 'bg-red-400 hover:bg-red-700'
      : props.primary
        ? 'bg-green-600 hover:bg-blue-700'
        : 'bg-slate-400 hover:bg-slate-700',
    ...classes,
  )
}

export default function Button(
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps,
): JSX.Element {
  let [local, rest] = splitProps(
    mergeProps(
      { type: 'button' as JSX.ButtonHTMLAttributes<HTMLButtonElement>['type'] },
      props,
    ),
    ['class', 'primary', 'danger', 'small'],
  )
  return (
    <button {...rest} class={classnames(local.class, buttonStyle(local))} />
  )
}
