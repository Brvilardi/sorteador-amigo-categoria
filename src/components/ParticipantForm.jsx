import React, { useState } from 'react'

const ParticipantForm = ({ participants, onParticipantsChange }) => {
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: ''
  })

  const handleAddParticipant = (e) => {
    e.preventDefault()
    
    if (!newParticipant.name.trim() || !newParticipant.email.trim()) {
      return
    }

    const participant = {
      id: Date.now(),
      name: newParticipant.name.trim(),
      email: newParticipant.email.trim()
    }

    onParticipantsChange([...participants, participant])
    setNewParticipant({ name: '', email: '' })
  }

  const handleRemoveParticipant = (id) => {
    onParticipantsChange(participants.filter(p => p.id !== id))
  }

  const handleInputChange = (field, value) => {
    setNewParticipant(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="participant-form">
      <h2>Participantes</h2>
      
      <form onSubmit={handleAddParticipant} className="add-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Nome do participante"
            value={newParticipant.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email do participante"
            value={newParticipant.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Adicionar
          </button>
        </div>
      </form>

      <div className="participants-list">
        {participants.length === 0 ? (
          <p className="empty-state">Nenhum participante adicionado ainda.</p>
        ) : (
          <div className="list">
            {participants.map((participant) => (
              <div key={participant.id} className="list-item">
                <div className="item-content">
                  <strong>{participant.name}</strong>
                  <span className="email">{participant.email}</span>
                </div>
                <button
                  onClick={() => handleRemoveParticipant(participant.id)}
                  className="btn btn-danger btn-small"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="count">
        Total de participantes: <strong>{participants.length}</strong>
      </div>
    </div>
  )
}

export default ParticipantForm