import { useState } from 'react'

const QUICK_EMOJIS = ['🍔', '🍕', '🍣', '🍛', '🌮', '🥐', '🍜', '🥙', '🥗', '🥘', '🥩', '🍱', '🥪', '🥟', '🥞', '🍩', '🍦', '🍹']

function ManageRestaurantsPage({ restaurants, onAddRestaurant, onAddDish, onDeleteDish, onDeleteRestaurant }) {
  // New restaurant form state
  const [newRestName, setNewRestName] = useState('')
  const [newRestTag, setNewRestTag] = useState('')
  const [newRestEmoji, setNewRestEmoji] = useState('🍜')
  const [showAddForm, setShowAddForm] = useState(false)
  const [restError, setRestError] = useState('')

  // Which restaurant card has the "Add Dish" form open (or default all visible)
  const [activeAddDishRestId, setActiveAddDishRestId] = useState(null)

  // New dish input per restaurant state: { [restaurantId]: { name: '', price: '' } }
  const [dishInputs, setDishInputs] = useState({})

  const handleCreateRestaurant = (e) => {
    e.preventDefault()
    if (!newRestName.trim()) {
      setRestError('Please enter a restaurant name.')
      return
    }
    if (!newRestTag.trim()) {
      setRestError('Please enter a cuisine/tag (e.g., Thai · Curry & Noodles).')
      return
    }

    const id = newRestName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `rest-${Date.now()}`
    
    onAddRestaurant({
      id,
      name: newRestName.trim(),
      emoji: newRestEmoji,
      tag: newRestTag.trim(),
      menu: []
    })

    setNewRestName('')
    setNewRestTag('')
    setNewRestEmoji('🍜')
    setShowAddForm(false)
    setRestError('')
  }

  const handleDishInputChange = (restId, field, value) => {
    setDishInputs(prev => ({
      ...prev,
      [restId]: {
        ...prev[restId],
        [field]: value
      }
    }))
  }

  const handleCreateDish = (e, restId) => {
    e.preventDefault()
    const input = dishInputs[restId] || {}
    const name = input.name ? input.name.trim() : ''
    const price = parseFloat(input.price)

    if (!name || isNaN(price) || price <= 0) return

    onAddDish(restId, { name, price })

    setDishInputs(prev => ({
      ...prev,
      [restId]: { name: '', price: '' }
    }))
  }

  const toggleAddDish = (restId) => {
    setActiveAddDishRestId(prev => (prev === restId ? null : restId))
  }

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Manage <span className="gradient-text">Restaurants & Menus</span></h2>
          <p>Add new restaurants, define dishes, and set custom prices.</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ width: 'auto', padding: '10px 20px', fontSize: '0.9rem' }}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Close Form' : '➕ Add Restaurant'}
        </button>
      </div>

      {/* Add New Restaurant Form */}
      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '32px', animation: 'fadeUp 0.3s ease' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>➕ Create New Restaurant</h3>
          <form onSubmit={handleCreateRestaurant}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Restaurant Name</label>
                <input
                  className="glass-input"
                  placeholder="e.g. Bangkok Spice"
                  value={newRestName}
                  onChange={e => setNewRestName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Cuisine & Tag</label>
                <input
                  className="glass-input"
                  placeholder="e.g. Thai · Curry & Noodles"
                  value={newRestTag}
                  onChange={e => setNewRestTag(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Select Emoji Icon</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    className="glass-input"
                    value={newRestEmoji}
                    onChange={e => setNewRestEmoji(e.target.value)}
                    style={{ width: '50px', textAlign: 'center', fontSize: '1.2rem', padding: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '200px' }}>
                    {QUICK_EMOJIS.slice(0, 8).map(emo => (
                      <button
                        key={emo}
                        type="button"
                        style={{
                          background: newRestEmoji === emo ? 'var(--brand-primary)' : 'rgba(255,255,255,0.08)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                        onClick={() => setNewRestEmoji(emo)}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {restError && <div className="error-msg" style={{ marginBottom: '16px' }}>{restError}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '10px 28px', fontSize: '0.9rem' }}>
              Save Restaurant
            </button>
          </form>
        </div>
      )}

      {/* Restaurants List & Menu Management */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {restaurants.map(rest => {
          const input = dishInputs[rest.id] || { name: '', price: '' }
          const isAddDishOpen = activeAddDishRestId === rest.id

          return (
            <div key={rest.id} className="glass-card" style={{ position: 'relative', padding: '24px' }}>
              {/* Top-Right Delete Button */}
              {onDeleteRestaurant && (
                <button
                  className="btn-danger-xs"
                  style={{ position: 'absolute', top: '20px', right: '20px' }}
                  title="Delete Restaurant"
                  onClick={() => {
                    if (window.confirm(`Delete restaurant "${rest.name}"?`)) {
                      onDeleteRestaurant(rest.id)
                    }
                  }}
                >
                  🗑️ Delete
                </button>
              )}

              {/* Restaurant info header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingRight: '90px' }}>
                <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{rest.emoji}</span>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>{rest.name}</h3>
                  <p className="restaurant-tag" style={{ margin: 0, marginTop: '2px' }}>{rest.tag}</p>
                </div>
              </div>

              {/* Section Header: Menu Dishes & Add Dish Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                  Menu Dishes ({rest.menu.length})
                </h4>

                <button
                  className="btn-outline-xs"
                  onClick={() => toggleAddDish(rest.id)}
                >
                  {isAddDishOpen ? '✕ Cancel' : '➕ Add Dish'}
                </button>
              </div>

              {/* Inline Add Dish Form (when open or if menu is empty) */}
              {(isAddDishOpen || rest.menu.length === 0) && (
                <form 
                  onSubmit={e => handleCreateDish(e, rest.id)} 
                  style={{ 
                    background: 'rgba(99, 102, 241, 0.06)', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    marginBottom: '16px',
                    animation: 'fadeUp 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      className="glass-input"
                      placeholder="Dish Name (e.g. Pad Thai)"
                      value={input.name || ''}
                      onChange={e => handleDishInputChange(rest.id, 'name', e.target.value)}
                      style={{ flex: '2', minWidth: '160px', padding: '8px 12px', fontSize: '0.88rem' }}
                    />
                    <input
                      className="glass-input"
                      type="number"
                      step="0.01"
                      placeholder="Price ($)"
                      value={input.price || ''}
                      onChange={e => handleDishInputChange(rest.id, 'price', e.target.value)}
                      style={{ flex: '1', minWidth: '100px', padding: '8px 12px', fontSize: '0.88rem' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '8px 18px', fontSize: '0.85rem' }}>
                      Save Dish
                    </button>
                  </div>
                </form>
              )}

              {/* Dishes list */}
              {rest.menu.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.88rem', margin: 0 }}>
                  No dishes added yet. Click "+ Add Dish" above to create one.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                  {rest.menu.map(dish => (
                    <div key={dish.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{dish.name}</div>
                        <div className="price-text" style={{ fontSize: '0.85rem' }}>${dish.price.toFixed(2)}</div>
                      </div>
                      <button
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}
                        title="Remove Dish"
                        onClick={() => onDeleteDish(rest.id, dish.name)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ManageRestaurantsPage
