import { useState } from 'react'
import Navbar from '../components/Navbar'
import './Login.css'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-card">
        <h1 className="login-title">Log in</h1>
        
        <form className="login-form" onSubmit={(e) => {
          e.preventDefault()
          // Handle login logic here
        }}>
          <div className="login-form-group">
            <label htmlFor="email" className="login-label">Enter your email address</label>
            <input
              type="email"
              id="email"
              className="login-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">Enter your password</label>
            <div className="login-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <img 
                  src={showPassword 
                    ? "https://online.123fakturera.se/components/icons/hide_password.png"
                    : "https://online.123fakturera.se/components/icons/show_password.png"
                  }
                  alt={showPassword ? 'Hide password' : 'Show password'}
                  className="login-password-icon"
                />
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn">Log in</button>
        </form>

        <div className="login-links">
          <a href="#" className="login-link">Register</a>
          <a href="#" className="login-link">Forgotten password?</a>
        </div>
      </div>
      <footer className="login-footer">
        <div className="login-footer-top">
          <div className="login-footer-brand">123 Fakturera</div>
          <div className="login-footer-buttons">
            <button className="login-footer-btn">Home</button>
            <button className="login-footer-btn">Order</button>
            <button className="login-footer-btn">Contact us</button>
          </div>
        </div>
        <div className="login-footer-line"></div>
        <p>© Lättfaktura, CRO no. 638537, 2025. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Login

