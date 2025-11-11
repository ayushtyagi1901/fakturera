import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

// Frontend-only translations for login page UI
const loginTranslations = {
  en: {
    title: 'Log in',
    usernameLabel: 'Enter your username',
    usernamePlaceholder: 'Username',
    passwordLabel: 'Enter your password',
    passwordPlaceholder: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    submitButton: 'Log in',
    register: 'Register',
    forgottenPassword: 'Forgotten password?',
    footerHome: 'Home',
    footerOrder: 'Order',
    footerContact: 'Contact us',
    footerCopyright: '© Lättfaktura, CRO no. 638537, 2025. All rights reserved.',
    errorMessage: 'Invalid username or password'
  },
  sv: {
    title: 'Logga in',
    usernameLabel: 'Ange ditt användarnamn',
    usernamePlaceholder: 'Användarnamn',
    passwordLabel: 'Ange ditt lösenord',
    passwordPlaceholder: 'Lösenord',
    showPassword: 'Visa lösenord',
    hidePassword: 'Dölj lösenord',
    submitButton: 'Logga in',
    register: 'Registrera',
    forgottenPassword: 'Glömt lösenord?',
    footerHome: 'Hem',
    footerOrder: 'Beställ',
    footerContact: 'Kontakta oss',
    footerCopyright: '© Lättfaktura, CRO no. 638537, 2025. Alla rättigheter förbehållna.',
    errorMessage: 'Ogiltigt användarnamn eller lösenord'
  }
}

function Login() {
  const navigate = useNavigate()
  const { currentLangCode } = useLanguage()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Get translations from local object based on current language
  const getLoginTranslation = (key) => {
    return loginTranslations[currentLangCode]?.[key] || loginTranslations.en[key] || key
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(username, password)
    
    if (result.success) {
      navigate('/dashboard/')
    } else {
      setError(result.error || getLoginTranslation('errorMessage'))
    }
    
    setLoading(false)
  }

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-card">
        <h1 className="login-title">{getLoginTranslation('title')}</h1>
        
        {error && (
          <div style={{ 
            color: '#dc2626', 
            textAlign: 'center', 
            marginBottom: '1rem',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="username" className="login-label">{getLoginTranslation('usernameLabel')}</label>
            <input
              type="text"
              id="username"
              className="login-input"
              placeholder={getLoginTranslation('usernamePlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">{getLoginTranslation('passwordLabel')}</label>
            <div className="login-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="login-input"
                placeholder={getLoginTranslation('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? getLoginTranslation('hidePassword') : getLoginTranslation('showPassword')}
              >
                <img 
                  src={showPassword 
                    ? "https://online.123fakturera.se/components/icons/hide_password.png"
                    : "https://online.123fakturera.se/components/icons/show_password.png"
                  }
                  alt={showPassword ? getLoginTranslation('hidePassword') : getLoginTranslation('showPassword')}
                  className="login-password-icon"
                />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? '...' : getLoginTranslation('submitButton')}
          </button>
        </form>

        <div className="login-links">
          <a href="#" className="login-link">{getLoginTranslation('register')}</a>
          <a href="#" className="login-link">{getLoginTranslation('forgottenPassword')}</a>
        </div>
      </div>
      <footer className="login-footer">
        <div className="login-footer-top">
          <div className="login-footer-brand">123 Fakturera</div>
          <div className="login-footer-buttons">
            <button className="login-footer-btn">{getLoginTranslation('footerHome')}</button>
            <button className="login-footer-btn">{getLoginTranslation('footerOrder')}</button>
            <button className="login-footer-btn">{getLoginTranslation('footerContact')}</button>
          </div>
        </div>
        <div className="login-footer-line"></div>
        <p>{getLoginTranslation('footerCopyright')}</p>
      </footer>
    </div>
  )
}

export default Login

