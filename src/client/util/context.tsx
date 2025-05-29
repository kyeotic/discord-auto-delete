import { createContext, type JSX, type ParentProps, useContext } from 'solid-js'

export function requiredContext<TContext, TProps extends ParentProps>(
  name: string,
  createValue: (props: TProps) => TContext,
) {
  const Context = createContext<TContext>()

  function use(): TContext {
    const ctx = useContext(Context)

    if (!ctx) throw new Error(`${name} must be used within a Context.Provider`)

    return ctx
  }

  function Provider(props: TProps): JSX.Element {
    const value = createValue(props)

    return <Context.Provider value={value}>{props.children}</Context.Provider>
  }

  return { use, Provider }
}

export function optionalContext<TContext, TProps extends ParentProps>(
  createValue: (props: TProps) => TContext,
) {
  const Context = createContext<TContext>()

  function use(): TContext | undefined {
    return useContext(Context)
  }

  function Provider(props: TProps): JSX.Element {
    const value = createValue(props)
    return <Context.Provider value={value}>{props.children}</Context.Provider>
  }

  return { use, Provider }
}
