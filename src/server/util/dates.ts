import { format } from 'date-fns'

export function toDayString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
