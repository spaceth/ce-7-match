import { createRoot } from 'react-dom/client'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import './styles.css'
import { LanguageProvider } from './content/Language'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
)
