import React, { useState } from 'react'

const CategoryForm = ({ categories, onCategoriesChange }) => {
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    minValue: '',
    giftIdeas: ''
  })

  const handleAddCategory = (e) => {
    e.preventDefault()
    
    if (!newCategory.name.trim() || !newCategory.description.trim() || !newCategory.minValue) {
      return
    }

    const category = {
      id: Date.now(),
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
      minValue: parseFloat(newCategory.minValue),
      giftIdeas: newCategory.giftIdeas.trim()
    }

    onCategoriesChange([...categories, category])
    setNewCategory({ name: '', description: '', minValue: '', giftIdeas: '' })
  }

  const handleRemoveCategory = (id) => {
    onCategoriesChange(categories.filter(c => c.id !== id))
  }

  const handleInputChange = (field, value) => {
    setNewCategory(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="category-form">
      <h2>Categorias de Presente</h2>
      
      <form onSubmit={handleAddCategory} className="add-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Nome da categoria (ex: Livros)"
            value={newCategory.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <textarea
            placeholder="Descrição da categoria"
            value={newCategory.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
            rows="2"
          />
        </div>
        
        <div className="form-row">
          <input
            type="number"
            placeholder="Valor mínimo (R$)"
            value={newCategory.minValue}
            onChange={(e) => handleInputChange('minValue', e.target.value)}
            min="0"
            step="0.01"
            required
          />
          <input
            type="text"
            placeholder="Sugestões de presente (opcional)"
            value={newCategory.giftIdeas}
            onChange={(e) => handleInputChange('giftIdeas', e.target.value)}
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Adicionar Categoria
        </button>
      </form>

      <div className="categories-list">
        {categories.length === 0 ? (
          <p className="empty-state">Nenhuma categoria adicionada ainda.</p>
        ) : (
          <div className="list">
            {categories.map((category) => (
              <div key={category.id} className="list-item category-item">
                <div className="item-content">
                  <div className="category-header">
                    <strong>{category.name}</strong>
                    <span className="min-value">
                      Mín: R$ {category.minValue.toFixed(2)}
                    </span>
                  </div>
                  <p className="description">{category.description}</p>
                  {category.giftIdeas && (
                    <p className="gift-ideas">
                      <em>Sugestões: {category.giftIdeas}</em>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveCategory(category.id)}
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
        Total de categorias: <strong>{categories.length}</strong>
      </div>
    </div>
  )
}

export default CategoryForm