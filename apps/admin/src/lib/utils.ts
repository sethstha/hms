// Utility re-exports used by shadcn-svelte components
// cn() is provided by @hms/utils to keep shared logic in one place
import { cn } from '@hms/utils'
import type { Snippet } from 'svelte'

export { cn }

// ─── Type helpers required by shadcn-svelte v1 components ────────────────────

/** Allows binding a ref to the underlying HTML element */
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null
}

/** Props that include an optional children snippet */
export type WithChildren<T = Record<never, never>> = T & {
  children?: Snippet
}

/** Props that include an optional class string */
export type WithClass<T = Record<never, never>> = T & {
  class?: string
}

/** Omit 'children' from props — for components that use render props instead */
export type WithoutChildren<T> = Omit<T, 'children'>

/** Omit 'child' from props — for components that use a single child render prop */
export type WithoutChild<T> = Omit<T, 'child'>

/** Omit both 'children' and 'child' from props */
export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>

// ─── General type utilities ───────────────────────────────────────────────────

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U

export function styleToString(style: Record<string, number | string | undefined>): string {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === undefined) return str
    return str + `${key}:${style[key]};`
  }, '')
}
