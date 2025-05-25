import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  MapPinIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'
import { useAuth } from './AuthContext'
import { useTheme } from '../theme/ThemeContext'
import Button from '../ui/Button'
import Input from '../ui/Input'
import LoadingSpinner from '../ui/LoadingSpinner'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  
  const { login, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous validation errors
    setValidationErrors({})
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        toast.success('Welcome back!')
        navigate(from, { replace: true })
      }
    } catch (error) {
      if (error.type === 'validation' && error.errors) {
        // Handle validation errors
        const fieldErrors = {}
        error.errors.forEach(err => {
          fieldErrors[err.path] = err.msg
        })
        setValidationErrors(fieldErrors)
        toast.error('Please check the form for errors')
      } else {
        // Handle general errors
        toast.error(error.message || 'Login failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-secondary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <MapPinIcon className="w-7 h-7" />
              </div>
              <span className="text-3xl font-bold">CityScope</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Connect with your
              <br />
              <span className="text-yellow-300">local community</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Discover what's happening around you, share local insights, 
              and build meaningful connections with your neighbors.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-300 rounded-full" />
                <span className="text-white/90">Hyper-local content discovery</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-300 rounded-full" />
                <span className="text-white/90">Real-time community updates</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-300 rounded-full" />
                <span className="text-white/90">Location-based networking</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg" />
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">CityScope</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Welcome back
              </h2>
              <p className="text-muted-foreground">
                Sign in to your CityScope account
              </p>
            </div>            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                error={validationErrors.email}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  error={validationErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full "
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Sign in
                    <ArrowRightIcon className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>

            {/* Theme toggle for mobile */}
            <div className="mt-8 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground"
              >
                {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
