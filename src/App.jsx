import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import AdminInterface from './components/AdminInterface'
import ParticipantView from './components/ParticipantView'
import AdminResults from './components/AdminResults'
import { loadDrawData, saveDrawData } from './utils/storage'
import './styles/App.css'

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
            element={<AdminInterface drawData={drawData} onSaveData={saveData} />} 
          />
          <Route 
            path="/participant/:id" 
            element={<ParticipantView drawData={drawData} />} 
          />
          <Route 
            path="/admin/results" 
            element={<AdminResults drawData={drawData} />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App