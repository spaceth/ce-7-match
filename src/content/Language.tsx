import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { languages, setLang, type Lang } from './index'

const STORAGE = 'ce7-lang'

function storedLang(): Lang {
  try {
    const value = localStorage.getItem(STORAGE)
    if (value === 'th' || value === 'en') return value
  } catch {
    /* Storage can be blocked. English remains the default. */
  }
  return 'en'
}

type LanguageContextValue = {
  lang: Lang
  choose: (next: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLanguage] = useState<Lang>(() => {
    const initial = storedLang()
    setLang(initial)
    return initial
  })

  useEffect(() => {
    setLang(lang)
    document.documentElement.lang = languages[lang].meta.lang
    document.title = languages[lang].meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', languages[lang].meta.description)
    try {
      localStorage.setItem(STORAGE, lang)
    } catch {
      /* Ignore a blocked write. The choice still applies for this visit. */
    }
  }, [lang])

  function choose(next: Lang) {
    setLang(next)
    setLanguage(next)
  }

  return <LanguageContext.Provider value={{ lang, choose }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used within LanguageProvider')
  return value
}
