import { JSX } from 'solid-js'

export default function Json(props: { data?: any }): JSX.Element {
  return <pre>{JSON.stringify(props.data, null, 2)}</pre>
}
