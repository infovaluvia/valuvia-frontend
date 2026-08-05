'use client'

import { Children, cloneElement, isValidElement, useId } from 'react'
import type { ReactElement, ReactNode } from 'react'

// Shared, accessible form-field wrapper (V1 launch spec TASK-UI-002:
// "Forms have labels, instructions, inline error summaries, and
// programmatic error association"). Generates a stable id and wires up
// label htmlFor + input id, plus aria-describedby for hint/error text
// and aria-invalid when there's an error -- previously every form in
// the app rendered a <label> as a visual sibling of its input with no
// programmatic link between them at all.
//
// Only the first element child is treated as "the input" and gets the
// id/aria-* wired onto it; any additional children (e.g. a trailing
// helper link) pass through untouched.
export default function Field({
  label,
  required = false,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const childArray = Children.toArray(children)
  const firstElementIndex = childArray.findIndex((child) => isValidElement(child))
  const field = childArray.map((child, index) => {
    if (index === firstElementIndex && isValidElement(child)) {
      return cloneElement(
        child as ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>,
        {
          id,
          'aria-describedby': describedBy,
          'aria-invalid': error ? true : undefined,
        },
      )
    }
    return child
  })

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-1 text-error">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {field}
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-foreground-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}
