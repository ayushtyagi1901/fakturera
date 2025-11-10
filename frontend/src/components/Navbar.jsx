import { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import '../pages/Login.css'

// Frontend-only translations for navbar
const navbarTranslations = {
  en: {
    home: 'Home',
    order: 'Order',
    customers: 'Our Customers',
    about: 'About Us',
    contact: 'Contact Us'
  },
  sv: {
    home: 'Hem',
    order: 'Beställ',
    customers: 'Våra kunder',
    about: 'Om oss',
    contact: 'Kontakta oss'
  }
}

function Navbar() {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { languages, currentLang, handleLanguageSelect, currentLangCode } = useLanguage()

  // Get translations from local object based on current language
  const getNavTranslation = (key) => {
    return navbarTranslations[currentLangCode]?.[key] || key
  }

  const handleLanguageClick = (language) => {
    handleLanguageSelect(language)
    setIsLangDropdownOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="login-navbar">
      <div className="login-navbar-content">
        <img
          src="https://storage.123fakturera.se/public/icons/diamond.png"
          alt="123 Fakturera Logo"
          className="login-navbar-logo"
        />
        <button 
          className="login-hamburger-menu"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        {isMobileMenuOpen && (
          <div className="login-mobile-menu-overlay" onClick={closeMobileMenu}></div>
        )}
        <div className={`login-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <a href="/login/" className="login-mobile-link" onClick={closeMobileMenu}>{getNavTranslation('home')}</a>
          <a href="/login/" className="login-mobile-link" onClick={closeMobileMenu}>{getNavTranslation('order')}</a>
          <a href="/login/" className="login-mobile-link" onClick={closeMobileMenu}>{getNavTranslation('customers')}</a>
          <a href="/terms/" className="login-mobile-link" onClick={closeMobileMenu}>{getNavTranslation('about')}</a>
          <a href="/login/" className="login-mobile-link" onClick={closeMobileMenu}>{getNavTranslation('contact')}</a>
        </div>
        <div className="login-navbar-right-group">
          <div className="login-navbar-links">
            <a href="/login/" className="login-navbar-link">{getNavTranslation('home')}</a>
            <a href="/login/" className="login-navbar-link">{getNavTranslation('order')}</a>
            <a href="/login/" className="login-navbar-link">{getNavTranslation('customers')}</a>
            <a href="/terms/" className="login-navbar-link">{getNavTranslation('about')}</a>
            <a href="/login/" className="login-navbar-link">{getNavTranslation('contact')}</a>
          </div>
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
                    onClick={() => handleLanguageClick(lang)}
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

