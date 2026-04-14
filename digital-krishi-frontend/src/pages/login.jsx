import React, { useState } from 'react'
import { Container, Form, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaLock, FaMobile, FaArrowRight, FaEye, FaEyeSlash, FaGlobe, FaChevronDown } from 'react-icons/fa'
import { GiWheat } from 'react-icons/gi'
import API from '../services/api'
import { translations, languages } from '../utils/translations'
import '../styles/Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState('hi')
  const [showLangDropdown, setShowLangDropdown] = useState(false)

  const t = translations[language]
  const currentLang = languages.find(l => l.code === language)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await API.post('/v1/auth/login', { phone, password })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setSuccess('Login successful! Redirecting...')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Invalid phone number or password')
            break
          case 404:
            setError('Account not found')
            setTimeout(() => {
              navigate('/register', { 
                state: { message: 'Account not found. Please register first to continue.' }
              })
            }, 2000)
            break
          case 429:
            setError('Too many attempts. Please try again later')
            break
          default:
            setError(err.response.data?.message || 'Login failed. Please try again.')
        }
      } else {
        setError('Network error. Please check your internet connection')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="farmer-login-wrapper">
      <div className="sunrise-background"></div>
      <div className="soft-overlay"></div>

      <div className="language-selector-top">
        <div className="lang-dropdown-wrapper">
          <button 
            className="lang-dropdown-btn" 
            onClick={() => setShowLangDropdown(!showLangDropdown)}
          >
            <FaGlobe /> {currentLang.name} <FaChevronDown className={showLangDropdown ? 'rotate' : ''} />
          </button>
          <AnimatePresence>
            {showLangDropdown && (
              <motion.div
                className="lang-dropdown-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${language === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(lang.code)
                      setShowLangDropdown(false)
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Container fluid className="farmer-container">
        <motion.div
          className="farmer-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="greeting-section">
            <h2 className="greeting-text">{t.greeting}</h2>
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
              <GiWheat className="wheat-icon" />
            </motion.div>
            <h1 className="platform-name">{t.title}</h1>
            <p className="support-text">{t.subtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="danger" className="farmer-alert" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="success" className="farmer-alert" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="farmer-input-group">
              <Form.Label className="farmer-label">
                <FaMobile /> {t.mobile}
              </Form.Label>
              <Form.Control
                type="tel"
                placeholder={t.mobilePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="farmer-input"
                required
              />
            </Form.Group>

            <Form.Group className="farmer-input-group">
              <Form.Label className="farmer-label">
                <FaLock /> {t.password}
              </Form.Label>
              <div className="password-wrapper">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="farmer-input"
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Form.Group>

            <motion.button
              type="submit"
              className="farmer-login-btn"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <><Spinner animation="border" size="sm" className="me-2" />{t.loading}</>
              ) : (
                <>{t.login} <FaArrowRight /></>
              )}
            </motion.button>
          </Form>

          <div className="footer-section">
            <a href="/forgot-password" className="footer-link">{t.forgotPassword}</a>
            <span className="dot">•</span>
            <a href="/register" className="footer-link">{t.register}</a>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}

export default Login
