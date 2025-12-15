import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import AdminInterface from './components/AdminInterface'
import ParticipantView from './components/ParticipantView'
import AdminResults from './components/AdminResults'
import { loadDrawData, saveDrawData } from './utils/storage'
import './styles/App.css'

// Component to protect admin routes from participant access
const ProtectedAdminRoute = ({ children, drawData }) => {
  const location = useLocation()
  
  // Check if user came from a participant route - if so, redirect to home
  useEffect(() => {
    const previousPath = document.referrer
    const currentHash = window.location.hash
    
    // Check multiple conditions for participant route access
    if (
      (previousPath && previousPath.includes('/participant/')) ||
      (currentHash && currentHash.includes('/participant/'))
    ) {
      // Prevent participant users from accessing admin routes
      window.location.hash = '#/'
      return
    }
    
    // Additional security: Clear any participant-related data when accessing admin routes
    if (typeof window !== 'undefined') {
      window.participantData = undefined
      delete window.participantData
    }
  }, [location])
  
  return children
}

// Component to ensure participants can't access admin routes
const SecureParticipantView = ({ drawData }) => {
  const location = useLocation()
  
  // Prevent any admin-related navigation from participant view
  useEffect(() => {
    // Clear any admin-related history or state
    if (location.pathname.includes('/participant/')) {
      // Clear any potential admin data from window/global scope
      if (typeof window !== 'undefined') {
        window.adminData = undefined
        window.drawData = undefined
        delete window.adminData
        delete window.drawData
      }
      
      // Prevent navigation to admin routes
      const handlePopState = (e) => {
        const currentHash = window.location.hash
        if (currentHash.includes('/admin') || currentHash === '#/' || currentHash === '') {
          e.preventDefault()
          window.history.pushState(null, '', `#${location.pathname}${location.search}`)
        }
      }
      
      window.addEventListener('popstate', handlePopState)
      
      // Cleanup function to remove event listener
      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [location])
  
  // Additional security: if no drawData or results, show error
  if (!drawData || !drawData.results) {
    return (
      <div className="participant-view error">
        <div className="container">
          <h1>Sorteio não encontrado</h1>
          <p>O sorteio ainda não foi realizado ou o link é inválido.</p>
        </div>
      </div>
    )
  }
  
  return <ParticipantView drawData={drawData} />
}

function App() {
  const [drawData, setDrawData] = useState(null)

  useEffect(() => {
    const data = loadDrawData()
    if (data) {
      setDrawData(data)
    }
  }, [])

  const saveData = (data) => {
    setDrawData(data)
    saveDrawData(data)
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedAdminRoute drawData={drawData}>
                <AdminInterface drawData={drawData} onSaveData={saveData} />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/participant/:id" 
            element={<SecureParticipantView drawData={drawData} />} 
          />
          <Route 
            path="/admin/results" 
            element={
              <ProtectedAdminRoute drawData={drawData}>
                <AdminResults drawData={drawData} />
              </ProtectedAdminRoute>
            } 
          />
          {/* Block any other admin routes */}
          <Route 
            path="/admin/*" 
            element={<Navigate to="/" replace />} 
          />
          {/* Catch-all route to prevent invalid access */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App