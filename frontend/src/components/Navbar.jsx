import { useState } from 'react'
import '../pages/Login.css'

function Navbar() {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('English')

  const languages = [
    { code: 'sv', name: 'Svenska', flag: 'https://storage.123fakturere.no/public/flags/SE.png' },
    { code: 'en', name: 'English', flag: 'https://storage.123fakturere.no/public/flags/GB.png' }
  ]

  const currentLang = languages.find((lang) => lang.name === selectedLanguage) || languages[1]

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name)
    setIsLangDropdownOpen(false)
  }

  return (
    <nav className="login-navbar">
      <div className="login-navbar-content">
        <img
          src="https://storage.123fakturera.se/public/icons/diamond.png"
          alt="123 Fakturera Logo"
          className="login-navbar-logo"
        />
        <div className="login-navbar-links">
          <a href="/login/" className="login-navbar-link">Home</a>
          <a href="/login/" className="login-navbar-link">Order</a>
          <a href="/login/" className="login-navbar-link">Our Customers</a>
          <a href="/terms/" className="login-navbar-link">About us</a>
          <a href="/login/" className="login-navbar-link">Contact Us</a>
          <div className="login-language-switcher">
            <button
              type="button"
              className="login-language-button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            >
              <span>{currentLang.name}</span>
              <img src={currentLang.flag} alt={currentLang.name} className="login-language-flag" />
            </button>
            {isLangDropdownOpen && (
              <div className="login-language-dropdown">
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className="login-language-option"
                    onClick={() => handleLanguageSelect(lang)}
                  >
                    <span>{lang.name}</span>
                    <img src={lang.flag} alt={lang.name} className="login-language-flag" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

