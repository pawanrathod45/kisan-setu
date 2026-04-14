import React, { useState, useEffect } from 'react'
import { Container, Form, Alert, Spinner, Row, Col, Button } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaLock, FaMobile, FaArrowRight, FaEye, FaEyeSlash, FaGlobe, FaChevronDown, FaUser, FaMapMarkerAlt, FaSeedling } from 'react-icons/fa'
import { GiWheat } from 'react-icons/gi'
import API from '../services/api'
import { translations, languages } from '../utils/translations'
import '../styles/Register.css'

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
    crop: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [language, setLanguage] = useState('hi')
  const [showLangDropdown, setShowLangDropdown] = useState(false)

  const t = translations[language]
  const currentLang = languages.find(l => l.code === language)
  const redirectMessage = location.state?.message

  useEffect(() => {
    getLocation()
  }, [])

  const getLocation = () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            // Use BigDataCloud API (no CORS issues)
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            )
            const data = await response.json()
            const city = data.city || data.locality || data.principalSubdivision || 'Unknown'
            setFormData(prev => ({ ...prev, location: city }))
          } catch (err) {
            console.error('Error getting location:', err)
            // Fallback to just showing coordinates
            setFormData(prev => ({ ...prev, location: `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}` }))
          } finally {
            setLocationLoading(false)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocationLoading(false)
        }
      )
    } else {
      setLocationLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await API.post('/v1/farmers', {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        location: formData.location,
        crop: formData.crop
      })

      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Registration failed. Please try again.')
      } else {
        setError('Network error. Please check your internet connection')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-wrapper">
      <div className="register-background"></div>
      <div className="register-overlay"></div>

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

      <Container fluid className="register-container">
        <motion.div
          className="register-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="register-header">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
              <GiWheat className="register-icon" />
            </motion.div>
            <h1 className="register-title">{t.title}</h1>
            <p className="register-subtitle">{t.registerTitle}</p>
          </div>

          <AnimatePresence mode="wait">
            {redirectMessage && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="warning" className="register-alert">
                  {redirectMessage}
                </Alert>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="danger" className="register-alert" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="success" className="register-alert" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="register-input-group">
                  <Form.Label className="register-label">
                    <FaUser /> {t.fullName}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder={t.fullNamePlaceholder}
                    value={formData.name}
                    onChange={handleChange}
                    className="register-input"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="register-input-group">
                  <Form.Label className="register-label">
                    <FaMobile /> {t.mobile}
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder={t.mobilePlaceholder}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    className="register-input"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="register-input-group">
                  <Form.Label className="register-label">
                    <FaMapMarkerAlt /> {t.location}
                  </Form.Label>
                  <div className="location-input-wrapper">
                    <Form.Control
                      type="text"
                      name="location"
                      placeholder={t.locationPlaceholder}
                      value={formData.location}
                      onChange={handleChange}
                      className="register-input"
                      required
                    />
                    <Button 
                      variant="link" 
                      className="detect-location-btn"
                      onClick={getLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? <Spinner size="sm" /> : <FaMapMarkerAlt />}
                    </Button>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="register-input-group">
                  <Form.Label className="register-label">
                    <FaSeedling /> {t.mainCrop}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="crop"
                    placeholder={t.mainCropPlaceholder}
                    value={formData.crop}
                    onChange={handleChange}
                    className="register-input"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="register-input-group">
                  <Form.Label className="register-label">
                    <FaLock /> {t.password}
                  </Form.Label>
                  <div className="password-wrapper">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder={t.passwordPlaceholder}
                      value={formData.password}
                      onChange={handleChange}
                      className="register-input"
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="register-input-group">
                  <Form.Label className="register-label">
                    <FaLock /> {t.confirmPassword}
                  </Form.Label>
                  <div className="password-wrapper">
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder={t.confirmPasswordPlaceholder}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="register-input"
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <motion.button
              type="submit"
              className="register-btn"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <><Spinner animation="border" size="sm" className="me-2" />{t.creatingAccount}</>
              ) : (
                <>{t.registerBtn} <FaArrowRight /></>
              )}
            </motion.button>
          </Form>

          <div className="register-footer">
            <p>{t.alreadyHaveAccount} <a href="/login" className="login-link">{t.loginHere}</a></p>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}

export default Register
