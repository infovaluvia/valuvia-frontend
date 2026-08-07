// Real gap found via live testing: phone numbers were stored as
// whatever raw string the customer typed, with no formatting feedback
// and no way to tell an incomplete number from a complete one until it
// showed up wrong (or blank) on the official application. Formats as
// the customer types (US 10-digit numbers only -- matches what the
// backend's _split_phone actually knows how to split) and separately
// reports whether what's there is a complete, valid number.

export function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits[0] === '1') digits = digits.slice(1)
  digits = digits.slice(0, 10)

  if (digits.length === 0) return ''
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function isCompletePhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 11 && digits[0] === '1')
}

// For an in-progress (non-empty, not-yet-complete) number -- distinct
// from "empty," which is fine since every phone field here is optional.
export function isIncompletePhone(raw: string): boolean {
  return raw.trim().length > 0 && !isCompletePhone(raw)
}
