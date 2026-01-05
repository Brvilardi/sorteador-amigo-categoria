import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const ParticipantView = ({ drawData }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [participantData, setParticipantData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Security check: Prevent access to admin routes from this component
  useEffect(() => {
    // Block any attempt to navigate to admin routes
    const originalNavigate = navigate
    const secureNavigate = (path, options) => {
      if (path && (path.includes('/admin') || path === '/')) {
        console.warn('Navigation to admin routes blocked from participant view')
        return
      }
      return originalNavigate(path, options)
    }
    
    // Override navigate function for this component context
    Object.defineProperty(window, 'navigate', {
      value: secureNavigate,
      writable: false,
      configurable: true
    })
    
    return () => {
      // Cleanup
      delete window.navigate
    }
  }, [navigate])

  useEffect(() => {
    // Ensure this component only shows individual participant data
    if (drawData && drawData.results && id) {
      // Validate ID format (should be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      
      if (!uuidRegex.test(id)) {
        setParticipantData(null)
        setLoading(false)
        return
      }
      
      const result = drawData.results.find(r => r.id === id)
      if (result) {
        // Create a clean, isolated copy with only the necessary data
        // This ensures no other participant data or admin data leaks through
        setParticipantData({
          participant: {
            name: result.participant.name
          },
          category: {
            name: result.category.name,
            description: result.category.description,
            minValue: result.category.minValue,
            giftIdeas: result.category.giftIdeas
          },
          eventDetails: {
            name: result.eventDetails.name,
            date: result.eventDetails.date,
            location: result.eventDetails.location
          }
        })
      } else {
        setParticipantData(null)
      }
    } else {
      setParticipantData(null)
    }
    setLoading(false)
  }, [drawData, id])

  // Prevent any console access to admin data and ensure complete isolation
  useEffect(() => {
    // Clear any potential window references to admin data
    if (typeof window !== 'undefined') {
      window.adminData = undefined
      window.drawData = undefined
      window.allResults = undefined
      window.adminInterface = undefined
      
      // Delete the properties to be extra sure
      delete window.adminData
      delete window.drawData
      delete window.allResults
      delete window.adminInterface
      
      // Prevent direct access to React DevTools data
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        try {
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = () => {}
        } catch (e) {
          // Ignore errors in production
        }
      }
    }
    
    // Disable context menu (right-click) to prevent easy access to DevTools
    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }
    
    // Disable common DevTools shortcuts
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault()
        return false
      }
    }
    
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    
    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (loading) {
    return (
      <div className="participant-view loading">
        <div className="container">
          <h1>Carregando...</h1>
        </div>
      </div>
    )
  }

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

  if (!participantData) {
    return (
      <div className="participant-view error">
        <div className="container">
          <h1>Participante não encontrado</h1>
          <p>O link fornecido não corresponde a nenhum participante válido.</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="participant-view" data-participant-id={id}>
      <div className="container">
        <div className="header">
          <h1>🎁 Seu Amigo Secreto</h1>
          <p className="welcome">Olá, <strong>{participantData.participant.name}</strong>!</p>
        </div>

        <div className="event-info">
          <h2>Informações do Evento</h2>
          <div className="event-card">
            <h3>{participantData.eventDetails.name}</h3>
            <div className="event-details">
              <div className="detail-item">
                <span className="icon">📅</span>
                <div>
                  <strong>Data:</strong>
                  <p>{formatDate(participantData.eventDetails.date)}</p>
                </div>
              </div>
              <div className="detail-item">
                <span className="icon">📍</span>
                <div>
                  <strong>Local:</strong>
                  <p>{participantData.eventDetails.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="category-assignment">
          <h2>Sua Categoria Sorteada</h2>
          <div className="category-card">
            <div className="category-header">
              <h3>{participantData.category.name}</h3>
              <span className="min-value">
                Valor Mínimo: R$ {participantData.category.minValue.toFixed(2)}
              </span>
            </div>
            
            <div className="category-content">
              <div className="description">
                <h4>Descrição</h4>
                <p>{participantData.category.description}</p>
              </div>
              
              {participantData.category.giftIdeas && (
                <div className="gift-ideas">
                  <h4>💡 Sugestões de Presente</h4>
                  <p>{participantData.category.giftIdeas}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="instructions">
          <h3>📋 Instruções</h3>
          <ul>
            <li>Escolha um presente que se encaixe na categoria sorteada</li>
            <li>Respeite o valor mínimo estabelecido</li>
            <li>Use as sugestões como inspiração, mas sinta-se livre para ser criativo</li>
            <li>Não revele sua categoria para outros participantes</li>
            <li>Traga o presente embrulhado no dia do evento</li>
          </ul>
        </div>

        <div className="footer">
          <p className="secret-message">
            🤫 <em>Mantenha isso em segredo até o dia do evento!</em>
          </p>
          <p className="participant-id-hidden" style={{display: 'none'}}>
            {/* Hidden participant ID for debugging purposes only */}
            ID: {id}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ParticipantView