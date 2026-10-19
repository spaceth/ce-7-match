import { en } from './en'
import type { Copy } from './shape'
import { th } from './th'

export type { Copy }

/**
 * The copy the site renders. `copy` follows the active language.
 * To add a language, duplicate en.ts, keep the same keys, and register it here.
 */
export const languages = { en, th } satisfies Record<string, Copy>

export type Lang = keyof typeof languages

let lang: Lang = 'en'

export function getLang(): Lang {
  return lang
}

export function setLang(next: Lang) {
  lang = next
}

export const copy: Copy = new Proxy({} as Copy, {
  get(_target, key) {
    if (typeof key !== 'string') return undefined
    return languages[lang][key as keyof Copy]
  },
  ownKeys() {
    return Reflect.ownKeys(languages[lang])
  },
  getOwnPropertyDescriptor(_target, key) {
    if (typeof key !== 'string') return undefined
    return {
      configurable: true,
      enumerable: true,
      value: languages[lang][key as keyof Copy],
    }
  },
})

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))
}
