import { en } from './en.ts'

/**
 * The copy the site renders. To add a language, duplicate en.ts and
 * change this export. Do not put sentences in components.
 */
export const copy = en

export type Copy = typeof en

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))
}
