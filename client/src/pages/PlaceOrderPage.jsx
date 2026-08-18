import { useState } from 'react'

function formatFoodItemsSummary(items = []) {
  const counts = {}
  items.forEach(i => { counts[i] = (counts[i] || 0) + 1 })
  return Object.entries(counts)
    .map(([name, qty]) => (qty > 1 ? `${name} ×${qty}` : name))
    .join(', ')
}

function PlaceOrderPage({ setPage, restaurants = [] }) {
  const [step, setStep] = useState(1)           // 1 = pick restaurant, 2 = pick items, 3 = confirm
  const [restaurant, setRestaurant] = useState(null)
  const [cart, setCart] = useState({})           // { itemName: qty } — qty >= 1
  const [customerName, setCustomerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)   // placed order object

  const selectedMenu = restaurant?.menu || []

  // Pick a restaurant — wipe cart if switching to a different one
  const pickRestaurant = (r) => {
    if (r.id !== restaurant?.id) setCart({})
    setRestaurant(r)
  }

  // Add one of this dish (first click adds qty 1, subsequent clicks increment)
  const addItem = (e, itemName) => {
    e.stopPropagation()
    setCart(prev => ({ ...prev, [itemName]: (prev[itemName] || 0) + 1 }))
  }

  // Remove one; delete key when qty reaches 0
  const removeItem = (e, itemName) => {
    e.stopPropagation()
    setCart(prev => {
      const next = { ...prev }
      if ((next[itemName] || 0) <= 1) delete next[itemName]
      else next[itemName] -= 1
      return next
    })
  }

  const totalAmount = selectedMenu
    .filter(i => cart[i.name])
    .reduce((s, i) => s + i.price * cart[i.name], 0)

  // Total number of individual items across all dishes
  const totalQty = Object.values(cart).reduce((s, q) => s + q, 0)
  const cartItems = Object.keys(cart)

  // ── Submit ──
  const handleSubmit = async () => {
    if (!customerName.trim()) { setError('Please enter your name.'); return }
    if (cartItems.length === 0) { setError('Please select at least one item.'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          restaurantName: restaurant.name,
          // Expand qty into repeated entries: Burger x2 → ['Burger', 'Burger']
          foodItems: cartItems.flatMap(name => Array(cart[name]).fill(name)),
          totalAmount: parseFloat(totalAmount.toFixed(2)),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setSuccess(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '48px 32px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ marginBottom: '8px' }}>Order Placed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Your order <strong style={{ color: 'var(--brand-primary)' }}>{success.orderId}</strong> has been received.
          </p>
          <div className="order-detail-row"><span>Customer</span><span>{success.customerName}</span></div>
          <div className="order-detail-row"><span>Restaurant</span><span>{success.restaurantName}</span></div>
          <div className="order-detail-row"><span>Items</span><span>{formatFoodItemsSummary(success.foodItems)}</span></div>
          <div className="order-detail-row"><span>Total</span><span className="price-text">${success.totalAmount.toFixed(2)}</span></div>
          <div className="order-detail-row"><span>Status</span><span className="status-chip placed">Placed</span></div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button className="btn btn-outline" onClick={() => { setSuccess(null); setStep(1); setRestaurant(null); setCart({}); setCustomerName('') }}>
              New Order
            </button>
            <button className="btn btn-primary" onClick={() => setPage('orders')}>
              Track Order →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: 860 }}>
      {/* Step indicator */}
      <div className="step-indicator">
        {['Restaurant', 'Menu', 'Confirm'].map((label, i) => (
          <div key={label} className={`step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
            <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Step 1: Pick Restaurant ── */}
      {step === 1 && (
        <>
          <div className="page-header">
            <h2>Choose a <span className="gradient-text">Restaurant</span></h2>
            <p>Pick where you want to order from.</p>
          </div>
          <div className="restaurant-grid">
            {restaurants.map(r => (
              <div
                key={r.id}
                className={`glass-card restaurant-card ${restaurant?.id === r.id ? 'selected' : ''}`}
                onClick={() => pickRestaurant(r)}
              >
                <div className="restaurant-emoji">{r.emoji}</div>
                <h3>{r.name}</h3>
                <p className="restaurant-tag">{r.tag}</p>
                {restaurant?.id === r.id && <div className="selected-check">✓ Selected</div>}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '14px 32px' }} disabled={!restaurant} onClick={() => setStep(2)}>
              Next: Pick Items →
            </button>
          </div>
        </>
      )}

      {/* ── Step 2: Pick Menu Items ── */}
      {step === 2 && (
        <>
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2>{restaurant.emoji} {restaurant.name}</h2>
              <p>Select items to add to your order.</p>
            </div>
            <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => { setCart({}); setStep(1) }}>
              ← Back
            </button>
          </div>

          <div className="menu-grid">
            {selectedMenu.map(item => {
              const qty = cart[item.name] || 0
              const inCart = qty > 0
              return (
                <div
                  key={item.name}
                  className={`glass-card menu-item-card ${inCart ? 'selected' : ''}`}
                  onClick={(e) => addItem(e, item.name)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="menu-item-name">{item.name}</span>
                    {/* Qty stepper — shown only once item is in cart */}
                    {inCart ? (
                      <div className="qty-stepper" onClick={e => e.stopPropagation()}>
                        <button className="qty-btn" onClick={(e) => removeItem(e, item.name)}>−</button>
                        <span className="qty-value">{qty}</span>
                        <button className="qty-btn" onClick={(e) => addItem(e, item.name)}>+</button>
                      </div>
                    ) : (
                      <span className="add-hint">+ Add</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span className="price-text">${item.price.toFixed(2)}</span>
                    {inCart && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>= ${(item.price * qty).toFixed(2)}</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Cart summary bar */}
          {totalQty > 0 && (
            <div className="cart-summary">
              <span>{totalQty} item{totalQty > 1 ? 's' : ''} in cart</span>
              <span className="price-text">${totalAmount.toFixed(2)}</span>
            </div>
          )}

          <div style={{ textAlign: 'right', marginTop: '16px' }}>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '14px 32px' }} disabled={cartItems.length === 0} onClick={() => setStep(3)}>
              Next: Confirm →
            </button>
          </div>
        </>
      )}

      {/* ── Step 3: Confirm & Submit ── */}
      {step === 3 && (
        <>
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2>Confirm <span className="gradient-text">Order</span></h2>
              <p>Review your order and place it.</p>
            </div>
            <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => setStep(2)}>
              ← Back
            </button>
          </div>

          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
            {/* Order summary */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Order Summary
              </h3>
              <div className="order-detail-row"><span>Restaurant</span><span>{restaurant.emoji} {restaurant.name}</span></div>
              {selectedMenu.filter(i => cart[i.name]).map(item => (
                <div className="order-detail-row" key={item.name}>
                  <span>{item.name} {cart[item.name] > 1 && <span style={{ color: 'var(--brand-primary)' }}>×{cart[item.name]}</span>}</span>
                  <span>${(item.price * cart[item.name]).toFixed(2)}</span>
                </div>
              ))}
              <div className="order-detail-row total-row">
                <span>Total</span>
                <span className="price-text">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer details */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Your Details
              </h3>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  className="glass-input"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>
              {error && <div className="error-msg">{error}</div>}
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ marginTop: '8px' }}
              >
                {submitting ? 'Placing Order…' : '🚀 Place Order'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PlaceOrderPage
