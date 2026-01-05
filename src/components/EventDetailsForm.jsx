import React from 'react'

const EventDetailsForm = ({ eventDetails, onEventDetailsChange }) => {
  const handleInputChange = (field, value) => {
    onEventDetailsChange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="event-details-form">
      <h2>Detalhes do Evento</h2>
      
      <div className="form-group">
        <label htmlFor="eventName">Nome do Evento</label>
        <input
          id="eventName"
          type="text"
          placeholder="Ex: Confraternização de Natal 2024"
          value={eventDetails.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="eventDate">Data do Evento</label>
        <input
          id="eventDate"
          type="date"
          value={eventDetails.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="eventLocation">Local do Evento</label>
        <input
          id="eventLocation"
          type="text"
          placeholder="Ex: Salão de Festas do Condomínio"
          value={eventDetails.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          required
        />
      </div>

      {eventDetails.name && eventDetails.date && eventDetails.location && (
        <div className="event-preview">
          <h3>Prévia do Evento</h3>
          <div className="preview-content">
            <p><strong>Evento:</strong> {eventDetails.name}</p>
            <p><strong>Data:</strong> {new Date(eventDetails.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
            <p><strong>Local:</strong> {eventDetails.location}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetailsForm