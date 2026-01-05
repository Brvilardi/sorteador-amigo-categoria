import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ParticipantForm from './ParticipantForm'
import CategoryForm from './CategoryForm'
import EventDetailsForm from './EventDetailsForm'
import { performDraw, validateDrawData } from '../utils/drawing'
import { clearDrawData } from '../utils/storage'

const AdminInterface = ({ drawData, onSaveData }) => {
  const navigate = useNavigate()
  const [participants, setParticipants] = useState([])
  const [categories, setCategories] = useState([])
  const [eventDetails, setEventDetails] = useState({
    name: '',
    date: '',
    location: ''
  })
  const [errors, setErrors] = useState([])
  const [isDrawExecuted, setIsDrawExecuted] = useState(false)

  useEffect(() => {
    if (drawData) {
      setParticipants(drawData.participants || [])
      setCategories(drawData.categories || [])
      setEventDetails(drawData.eventDetails || { name: '', date: '', location: '' })
      setIsDrawExecuted(!!drawData.results)
    }
  }, [drawData])

  const handleExecuteDraw = () => {
    const validationErrors = validateDrawData(participants, categories, eventDetails)
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors([])
    
    try {
      const drawResult = performDraw(participants, categories, eventDetails)
      onSaveData(drawResult)
      setIsDrawExecuted(true)
      
      // Redirecionar para a página de resultados
      navigate('/admin/results')
    } catch (error) {
      setErrors([error.message])
    }
  }

  const handleNewDraw = () => {
    clearDrawData()
    setParticipants([])
    setCategories([])
    setEventDetails({ name: '', date: '', location: '' })
    setErrors([])
    setIsDrawExecuted(false)
    onSaveData(null)
  }

  if (isDrawExecuted && drawData) {
    return (
      <div className="admin-interface">
        <div className="container">
          <h1>Sorteio Executado com Sucesso!</h1>
          <div className="success-message">
            <p>O sorteio foi realizado e todos os participantes receberam suas categorias.</p>
            <div className="action-buttons">
              <button 
                onClick={() => navigate('/admin/results')}
                className="btn btn-primary"
              >
                Ver Resultados
              </button>
              <button 
                onClick={handleNewDraw}
                className="btn btn-secondary"
              >
                Novo Sorteio
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-interface">
      <div className="container">
        <h1>Administração - Sorteio Amigo Categoria</h1>
        
        {errors.length > 0 && (
          <div className="error-messages">
            <h3>Erros encontrados:</h3>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="forms-grid">
          <div className="form-section">
            <EventDetailsForm 
              eventDetails={eventDetails}
              onEventDetailsChange={setEventDetails}
            />
          </div>

          <div className="form-section">
            <ParticipantForm 
              participants={participants}
              onParticipantsChange={setParticipants}
            />
          </div>

          <div className="form-section">
            <CategoryForm 
              categories={categories}
              onCategoriesChange={setCategories}
            />
          </div>
        </div>

        <div className="summary">
          <h3>Resumo</h3>
          <p><strong>Participantes:</strong> {participants.length}</p>
          <p><strong>Categorias:</strong> {categories.length}</p>
          <p><strong>Evento:</strong> {eventDetails.name || 'Não informado'}</p>
          {participants.length > 0 && categories.length > 0 && (
            <p className="distribution-info">
              <em>
                Cada categoria será atribuída a {Math.floor(participants.length / categories.length)} participante(s).
                {participants.length % categories.length > 0 && 
                  ` ${participants.length % categories.length} categoria(s) será(ão) atribuída(s) a um participante adicional.`
                }
              </em>
            </p>
          )}
        </div>

        <div className="execute-section">
          <button 
            onClick={handleExecuteDraw}
            className="btn btn-primary btn-large"
            disabled={participants.length === 0 || categories.length === 0}
          >
            Executar Sorteio
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminInterface