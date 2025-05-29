import classnames from 'classnames'

export function headerStyle(): string {
  return 'font-extrabold tracking-tight text-gray-900 dark:text-white'
}

export function bodyStyle(...classes: string[]): string {
  return classnames('text-gray-600 dark:text-gray-400', ...classes)
}
