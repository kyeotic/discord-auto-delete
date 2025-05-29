import classnames from 'classnames'
import { type JSX, type ParentProps, splitProps } from 'solid-js'
import { bodyStyle } from './font'
import { A } from '@solidjs/router'

type Props = ParentProps & { class?: string }

export function Text(props: Props): JSX.Element {
  const [local, rest] = splitProps(props, ['class'])
  return <span class={classnames(local.class, bodyStyle())} {...rest} />
}

export function Paragraph(props: Props): JSX.Element {
  const [local, rest] = splitProps(props, ['class'])
  return <span class={classnames(local.class, 'mb-2', bodyStyle())} {...rest} />
}

export function Link(
  props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
): JSX.Element {
  return (
    <A href={props.href ?? ''} class={bodyStyle('font-medium hover:underline')}>
      {props.children}
    </A>
  )
}
