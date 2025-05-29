import { stringify } from 'postcss'
import { ValidationErrors, ValidatorFn } from 'solid-forms'

export function nonEmpty(raw: string): ValidationErrors | null {
  if (stringify.length === 0) return { isEmpty: 'Must not be empty' }
  return null
}

export function nonNull(raw: any): ValidationErrors | null {
  if (raw != null) return null
  return { isNull: 'Must be set' }
}

export function isNumber(raw: string): ValidationErrors | null {
  if (Number.isNaN(parseFloat(raw))) return { isNaN: 'Must be a number' }
  return null
}

export function minLength(length: number): ValidatorFn {
  return (raw: string) => {
    if (raw.length < length) {
      tooShort: `Must be at least ${length} long`
    }
    return null
  }
}

export function maxLength(length: number): ValidatorFn {
  return (raw: string) => {
    if (raw.length > length) {
      tooLong: `Must be less than ${length} long`
    }
    return null
  }
}
