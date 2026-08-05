'use client'

import { useState } from 'react'
import Input from './Input'

// `value`/`onChange` carry a plain numeric dollar string (e.g. "5285536"
// or "5285536.00" — no $, no commas), matching what OCR extraction and
// Math.round(parseFloat(value) * 100) both expect.
export function sanitizeMoneyString(raw: string): string {
  const digitsAndDot = raw.replace(/[^0-9.]/g, '')
  const firstDot = digitsAndDot.indexOf('.')
  if (firstDot === -1) return digitsAndDot
  // Keep only the first decimal point a user (or OCR) produced.
  return digitsAndDot.slice(0, firstDot + 1) + digitsAndDot.slice(firstDot + 1).replace(/\./g, '')
}

function formatDisplay(raw: string): string {
  if (!raw) return ''
  const [intPart, decPart] = raw.split('.')
  const withCommas = (intPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas
}

export default function MoneyInput({
  value,
  onChange,
  required,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: {
  value: string
  onChange: (value: string) => void
  required?: boolean
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}) {
  // Reformatting with commas on every keystroke (while the field is
  // focused) fights the cursor position and, combined with a stale
  // regex match, was corrupting values mid-edit. Simpler and more
  // robust: show the raw digits while typing, and only comma-format
  // once the user leaves the field.
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[0.95rem] text-foreground-muted">
        $
      </span>
      <Input
        type="text"
        inputMode="decimal"
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        value={focused ? value : formatDisplay(value)}
        onChange={(e) => onChange(sanitizeMoneyString(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="0.00"
        required={required}
        className="pl-7"
      />
    </div>
  )
}
