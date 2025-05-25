import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  MapPinIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from './AuthContext'
import { useTheme } from '../theme/ThemeContext'
import Button from '../ui/Button'
import Input from '../ui/Input'
import LoadingSpinner from '../ui/LoadingSpinner'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(''); // 'checking', 'valid', 'invalid'
  
  const { register, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Real-time username validation
    if (name === 'username' && value) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(value)) {
        setUsernameStatus('invalid');
      } else if (value.length >= 3) {
        setUsernameStatus('valid');
      } else {
        setUsernameStatus('');
      }
    } else if (name === 'username') {
      setUsernameStatus('');
    }
  };

  const clearAllErrors = () => {
    setValidationErrors({});
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return false
    }
    if (!formData.username.trim()) {
      toast.error('Username is required')
      return false
    }
    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters')
      return false
    }
    if (!formData.email.trim()) {
      toast.error('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.password) {
      toast.error('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    if (!formData.location.trim()) {
      toast.error('Location is required')
      return false
    }
    return true
  }
  const handleNext = () => {
    clearAllErrors();
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep2()) return

    setIsLoading(true)
    clearAllErrors()
      try {
      const result = await register({
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        location: formData.location.trim()
      })
      if (result.success) {
        toast.success('Welcome to CityScope!')
        navigate('/', { replace: true })
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.type === 'validation' && error.errors) {
        // Handle validation errors
        const fieldErrors = {};
        error.errors.forEach(err => {
          fieldErrors[err.path] = err.msg;
        });
        setValidationErrors(fieldErrors);
          // Show a user-friendly toast message
        toast.error('Please fix the errors below and try again', {
          duration: 4000,
          icon: '⚠️',
          style: {
            background: 'var(--color-error-50)',
            color: 'var(--color-error-700)',
            border: '1px solid var(--color-error-200)',
          }
        });
        
        // If there are errors in step 1 fields, go back to step 1
        const step1Fields = ['name', 'username', 'email'];
        const hasStep1Errors = error.errors.some(err => step1Fields.includes(err.path));
        if (hasStep1Errors && step === 2) {
          setStep(1);
        }
      } else {
        // Handle general errors
        toast.error(error.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { text: 'At least 6 characters', met: formData.password.length >= 6 },
    { text: 'Passwords match', met: formData.password && formData.password === formData.confirmPassword }
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary via-accent to-primary relative overflow-hidden">
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
              Join your
              <br />
              <span className="text-emerald-300">neighborhood network</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Be part of a growing community where local voices matter. 
              Share, discover, and connect with people who shape your city.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                <span className="text-white/90">Connect with local residents</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                <span className="text-white/90">Share community insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                <span className="text-white/90">Stay informed about your area</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-emerald-300/20 rounded-full blur-lg" />
      </div>

      {/* Right side - Registration form */}
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
                Create your account
              </h2>
              <p className="text-muted-foreground">
                Step {step} of 2 - {step === 1 ? 'Basic Information' : 'Security & Location'}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > 1 ? <CheckIcon className="w-4 h-4" /> : '1'}
                </div>
                <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
              </div>
            </div>

            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="space-y-6">              {step === 1 ? (
                <>
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    disabled={isLoading}
                    error={validationErrors.name}
                  />                  <div>
                    <Input
                      label="Username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a unique username"
                      required
                      disabled={isLoading}
                      minLength={3}
                      error={validationErrors.username}
                    />
                    
                    {/* Real-time username validation feedback */}
                    {formData.username && !validationErrors.username && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2"
                      >
                        {usernameStatus === 'valid' && (
                          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                            <CheckIcon className="w-4 h-4" />
                            <span>Username looks good!</span>
                          </div>
                        )}
                        {usernameStatus === 'invalid' && (
                          <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                            <XMarkIcon className="w-4 h-4" />
                            <span>Only letters, numbers, and underscores allowed</span>
                          </div>
                        )}
                        {usernameStatus === '' && formData.username.length > 0 && formData.username.length < 3 && (
                          <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
                            <span className="w-4 h-4 flex items-center justify-center">⚠️</span>
                            <span>Username must be at least 3 characters</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {/* Server validation error display */}
                    {validationErrors.username && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      >
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                          {validationErrors.username}
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                          💡 Tip: Usernames can only contain letters, numbers, and underscores (no hyphens)
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                    error={validationErrors.email}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    Continue
                    <ArrowRightIcon className="ml-2 w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      required
                      disabled={isLoading}
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

                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password requirements */}
                  {formData.password && (
                    <div className="space-y-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          {req.met ? (
                            <CheckIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <XMarkIcon className="w-4 h-4 text-red-500" />
                          )}
                          <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}                  <Input
                    label="Location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State/Province, Country"
                    required
                    disabled={isLoading}
                    error={validationErrors.location}
                  />

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in instead
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

export default Register
