import { createStore, SetStoreFunction, Store } from 'solid-js/store'

export abstract class SignalStore<T extends object> {
  protected store: Store<T>
  protected setStore: SetStoreFunction<T>

  constructor(initialState: T) {
    const [store, setStore] = createStore(initialState)
    this.store = store
    this.setStore = setStore
  }
}
