const STORAGE_KEY = 'secret_santa_draw_data'

export const saveDrawData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Erro ao salvar dados:', error)
  }
}

export const loadDrawData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    return null
  }
}

export const clearDrawData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Erro ao limpar dados:', error)
  }
}