import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useLanguage } from '../contexts/LanguageContext'
import API_URL from '../config/api.js'
import './Terms.css'
import './Login.css'

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

  const getTermsTranslation = (key) => {
    return termsTranslations[currentLangCode]?.[key] || key
  }

  useEffect(() => {
    const fetchTerms = async () => {
      setLoading(true)
      setError(null)
      try {
        const useVercelConfig = import.meta.env.VITE_USE_VERCEL_CONFIG === '1'
        
        if (useVercelConfig) {
          const response = await fetch('/terms.json')
          if (!response.ok) {
            throw new Error(`Failed to fetch terms: ${response.statusText}`)
          }
          const data = await response.json()
          const content = data[currentLangCode] || data['en'] || ''
          setTermsContent(content)
        } else {
          const response = await fetch(`${API_URL}/api/terms?lang=${currentLangCode}`)
          if (!response.ok) {
            throw new Error(`Failed to fetch terms: ${response.statusText}`)
          }
          const data = await response.json()
          setTermsContent(data.content)
        }
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
