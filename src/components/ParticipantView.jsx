import React, { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'

const ParticipantView = ({ drawData }) => {
  const { id } = useParams()
  const [participantData, setParticipantData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (drawData && drawData.results) {
      const result = drawData.results.find(r => r.id === id)
      setParticipantData(result)
    }
    setLoading(false)
  }, [drawData, id])

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
    <div className="participant-view">
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
        </div>
      </div>
    </div>
  )
}

export default ParticipantView