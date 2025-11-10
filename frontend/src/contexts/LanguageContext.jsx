import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  
  const languages = [
    { code: 'sv', name: 'Svenska', flag: 'https://storage.123fakturere.no/public/flags/SE.png' },
    { code: 'en', name: 'English', flag: 'https://storage.123fakturere.no/public/flags/GB.png' }
  ]

  const currentLang = languages.find((lang) => lang.name === selectedLanguage) || languages[1]
  const currentLangCode = currentLang.code

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name)
  }

  return (
    <LanguageContext.Provider value={{
      selectedLanguage,
      setSelectedLanguage,
      languages,
      currentLang,
      currentLangCode,
      handleLanguageSelect
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

