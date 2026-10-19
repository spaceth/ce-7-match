import { en } from './en'

type WidenStrings<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly [infer A, ...infer R]
        ? readonly [WidenStrings<A>, ...WidenRest<R>]
        : T extends readonly (infer U)[]
          ? readonly WidenStrings<U>[]
          : T extends object
            ? { readonly [K in keyof T]: WidenStrings<T[K]> }
            : T

type WidenRest<T> = T extends readonly [infer A, ...infer R] ? [WidenStrings<A>, ...WidenRest<R>] : []

/** Same keys as the English catalog. Sentence values may differ by language. */
export type Copy = WidenStrings<typeof en>
