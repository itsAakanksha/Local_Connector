import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './components/theme/ThemeContext'
import { AuthProvider } from './components/auth/AuthContext'
import Layout from './components/layout/Layout'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Feed from './components/feed/Feed'
import Profile from './components/profile/Profile'
import CreatePost from './components/post/CreatePost'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Feed />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/create" element={
                <ProtectedRoute>
                  <Layout>
                    <CreatePost />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile/:userId?" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'toast',
                style: {
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border)',
                }
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
