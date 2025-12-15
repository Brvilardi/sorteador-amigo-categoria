import { v4 as uuidv4 } from './uuid'

// Função para criar um array de categorias ajustado ao número de participantes
export const adjustCategoriesToParticipants = (participants, categories) => {
  const participantCount = participants.length
  const categoryCount = categories.length
  
  if (participantCount === 0 || categoryCount === 0) {
    return []
  }
  
  const adjustedCategories = []
  
  // Distribui as categorias repetindo conforme necessário
  for (let i = 0; i < participantCount; i++) {
    adjustedCategories.push(categories[i % categoryCount])
  }
  
  return adjustedCategories
}

// Função para embaralhar um array (Fisher-Yates shuffle)
export const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Função principal para realizar o sorteio
export const performDraw = (participants, categories, eventDetails) => {
  if (!participants.length || !categories.length) {
    throw new Error('É necessário ter pelo menos um participante e uma categoria')
  }
  
  // Ajusta as categorias para o número de participantes
  const adjustedCategories = adjustCategoriesToParticipants(participants, categories)
  
  // Embaralha as categorias
  const shuffledCategories = shuffleArray(adjustedCategories)
  
  // Cria os resultados do sorteio
  const results = participants.map((participant, index) => ({
    id: uuidv4(),
    participant: participant,
    category: shuffledCategories[index],
    eventDetails: eventDetails,
    createdAt: new Date().toISOString()
  }))
  
  return {
    id: uuidv4(),
    participants,
    categories,
    eventDetails,
    results,
    createdAt: new Date().toISOString()
  }
}

// Função para validar dados antes do sorteio
export const validateDrawData = (participants, categories, eventDetails) => {
  const errors = []
  
  if (!participants || participants.length === 0) {
    errors.push('É necessário adicionar pelo menos um participante')
  }
  
  if (!categories || categories.length === 0) {
    errors.push('É necessário adicionar pelo menos uma categoria')
  }
  
  if (!eventDetails.name || eventDetails.name.trim() === '') {
    errors.push('Nome do evento é obrigatório')
  }
  
  if (!eventDetails.date || eventDetails.date.trim() === '') {
    errors.push('Data do evento é obrigatória')
  }
  
  if (!eventDetails.location || eventDetails.location.trim() === '') {
    errors.push('Local do evento é obrigatório')
  }
  
  // Validar participantes
  participants.forEach((participant, index) => {
    if (!participant.name || participant.name.trim() === '') {
      errors.push(`Nome do participante ${index + 1} é obrigatório`)
    }
    if (!participant.email || participant.email.trim() === '') {
      errors.push(`Email do participante ${index + 1} é obrigatório`)
    } else if (!isValidEmail(participant.email)) {
      errors.push(`Email do participante ${index + 1} é inválido`)
    }
  })
  
  // Validar categorias
  categories.forEach((category, index) => {
    if (!category.name || category.name.trim() === '') {
      errors.push(`Nome da categoria ${index + 1} é obrigatório`)
    }
    if (!category.description || category.description.trim() === '') {
      errors.push(`Descrição da categoria ${index + 1} é obrigatória`)
    }
    if (!category.minValue || category.minValue <= 0) {
      errors.push(`Valor mínimo da categoria ${index + 1} deve ser maior que zero`)
    }
  })
  
  return errors
}

// Função para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}