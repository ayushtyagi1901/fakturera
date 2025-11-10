import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useLanguage } from '../contexts/LanguageContext'
import './Terms.css'
import './Login.css'

// Frontend-only translations for terms page UI
const termsTranslations = {
  en: {
    title: 'Terms and Conditions',
    close: 'Close'
  },
  sv: {
    title: 'Villkor',
    close: 'Stäng'
  }
}

function Terms() {
  const navigate = useNavigate()
  const { currentLangCode } = useLanguage()
  const [termsContent, setTermsContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get translations from local object based on current language
  const getTermsTranslation = (key) => {
    return termsTranslations[currentLangCode]?.[key] || key
  }

  useEffect(() => {
    const fetchTerms = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://localhost:3001/api/terms?lang=${currentLangCode}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch terms: ${response.statusText}`)
        }
        const data = await response.json()
        setTermsContent(data.content)
      } catch (err) {
        console.error('Error fetching terms:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTerms()
  }, [currentLangCode])

  return (
    <div className="terms-container">
      <Navbar />

      <div className="terms-wrapper">
        <div className="terms-header">
          <h1 className="terms-title">{getTermsTranslation('title')}</h1>
          <button className="terms-close-btn" onClick={() => navigate('/login/')}>
            {getTermsTranslation('close')}
          </button>
        </div>

        <div className="terms-content-box">
          {loading && <p>Loading terms...</p>}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          {!loading && !error && termsContent && (
            <div style={{ whiteSpace: 'pre-line' }}>
              {termsContent.split('\n\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index}>{paragraph.trim()}</p>
                )
              ))}
            </div>
          )}
        </div>

        <button className="terms-close-btn terms-close-btn-bottom" onClick={() => navigate('/login/')}>
          {getTermsTranslation('close')}
        </button>
      </div>
    </div>
  )
}

export default Terms
