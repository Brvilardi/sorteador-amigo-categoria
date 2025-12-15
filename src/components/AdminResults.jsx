import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const AdminResults = ({ drawData }) => {
  const navigate = useNavigate()

  if (!drawData || !drawData.results) {
    return (
      <div className="admin-results error">
        <div className="container">
          <h1>Resultados não encontrados</h1>
          <p>Nenhum sorteio foi realizado ainda.</p>
          <Link to="/" className="btn btn-primary">
            Voltar para Administração
          </Link>
        </div>
      </div>
    )
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copiado para a área de transferência!')
    }).catch(() => {
      alert('Erro ao copiar o link. Selecione e copie manualmente.')
    })
  }

  const getParticipantLink = (resultId) => {
    return `${window.location.origin}/participant/${resultId}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  return (
    <div className="admin-results">
      <div className="container">
        <div className="header">
          <h1>Resultados do Sorteio</h1>
          <div className="header-actions">
            <Link to="/" className="btn btn-secondary">
              Nova Configuração
            </Link>
          </div>
        </div>

        <div className="draw-info">
          <h2>Informações do Sorteio</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Evento:</strong> {drawData.eventDetails.name}
            </div>
            <div className="info-item">
              <strong>Data do Evento:</strong> {new Date(drawData.eventDetails.date + 'T00:00:00').toLocaleDateString('pt-BR')}
            </div>
            <div className="info-item">
              <strong>Local:</strong> {drawData.eventDetails.location}
            </div>
            <div className="info-item">
              <strong>Sorteio realizado em:</strong> {formatDate(drawData.createdAt)}
            </div>
            <div className="info-item">
              <strong>Total de Participantes:</strong> {drawData.participants.length}
            </div>
            <div className="info-item">
              <strong>Total de Categorias:</strong> {drawData.categories.length}
            </div>
          </div>
        </div>

        <div className="results-section">
          <h2>Links de Acesso dos Participantes</h2>
          <p className="instructions">
            Envie o link correspondente para cada participante. Cada link é único e mostra apenas a categoria sorteada para aquela pessoa.
          </p>
          
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Participante</th>
                  <th>Email</th>
                  <th>Categoria Sorteada</th>
                  <th>Valor Mínimo</th>
                  <th>Link de Acesso</th>
                </tr>
              </thead>
              <tbody>
                {drawData.results.map((result) => (
                  <tr key={result.id}>
                    <td className="participant-name">
                      {result.participant.name}
                    </td>
                    <td className="participant-email">
                      {result.participant.email}
                    </td>
                    <td className="category-name">
                      {result.category.name}
                    </td>
                    <td className="min-value">
                      R$ {result.category.minValue.toFixed(2)}
                    </td>
                    <td className="link-cell">
                      <div className="link-actions">
                        <a 
                          href={getParticipantLink(result.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-small"
                        >
                          Abrir
                        </a>
                        <button
                          onClick={() => copyToClipboard(getParticipantLink(result.id))}
                          className="btn btn-secondary btn-small"
                        >
                          Copiar
                        </button>
                      </div>
                      <div className="link-url">
                        {getParticipantLink(result.id)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="categories-summary">
          <h3>Resumo das Categorias Utilizadas</h3>
          <div className="categories-grid">
            {drawData.categories.map((category) => {
              const usageCount = drawData.results.filter(r => r.category.id === category.id).length
              return (
                <div key={category.id} className="category-summary-card">
                  <h4>{category.name}</h4>
                  <p>{category.description}</p>
                  <div className="category-stats">
                    <span className="usage-count">
                      Utilizada {usageCount} vez(es)
                    </span>
                    <span className="min-value">
                      R$ {category.minValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="export-section">
          <h3>Enviar Links para Participantes</h3>
          <p>
            Você pode copiar os links individuais da tabela acima e enviá-los por email, 
            WhatsApp ou outro meio de comunicação para cada participante.
          </p>
          <div className="export-tips">
            <h4>💡 Dicas para envio:</h4>
            <ul>
              <li>Envie o link individual para cada participante</li>
              <li>Inclua as informações do evento (data, local, horário)</li>
              <li>Lembre os participantes de não compartilharem suas categorias</li>
              <li>Defina uma data limite para a compra dos presentes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminResults