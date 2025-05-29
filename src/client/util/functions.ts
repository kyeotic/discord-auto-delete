export function noop() {}

export async function withRollback<T extends () => Promise<R>, R>(
  action: T,
  onFail: T,
  rethrow = true,
): Promise<R> {
  try {
    return await action()
  } catch (e: any) {
    const r = await onFail()
    if (rethrow) throw e
    return r
  }
}
