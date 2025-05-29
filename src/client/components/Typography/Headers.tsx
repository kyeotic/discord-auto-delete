import classnames from 'classnames'
import { type JSX, type ParentProps, splitProps } from 'solid-js'
import { headerStyle } from './font'

const headerBase = `font-semibold mb-3 ${headerStyle()}`

export function H1(props: ParentProps & { class?: string }): JSX.Element {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <h1 class={classnames('text-4xl', headerBase, local.class)} {...rest} />
  )
}

export function H2(props: ParentProps & { class?: string }): JSX.Element {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <h2 class={classnames(local.class, 'text-3xl', headerBase)} {...rest} />
  )
}

export function H3(props: ParentProps & { class?: string }): JSX.Element {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <h3 class={classnames(local.class, 'text-2xl', headerBase)} {...rest} />
  )
}

export function H4(props: ParentProps & { class?: string }): JSX.Element {
  const [local, rest] = splitProps(props, ['class'])
  return <h4 class={classnames(local.class, 'text-xl', headerBase)} {...rest} />
}

export function H5(props: ParentProps & { class?: string }): JSX.Element {
  const [local, rest] = splitProps(props, ['class'])
  return <h5 class={classnames(local.class, 'text-lg', headerBase)} {...rest} />
}

export function H6(props: ParentProps & { class?: string }): JSX.Element {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <h6 class={classnames(local.class, 'text-base', headerBase)} {...rest} />
  )
}
