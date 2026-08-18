import { useState, useEffect, useCallback } from 'react'

const STATUS_OPTIONS = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']

const STATUS_META = {
  'Placed':           { className: 'placed',    emoji: '🕐' },
  'Preparing':        { className: 'preparing', emoji: '👨‍🍳' },
  'Out for Delivery': { className: 'delivery',  emoji: '🛵' },
  'Delivered':        { className: 'delivered', emoji: '✅' },
  'Cancelled':        { className: 'cancelled', emoji: '❌' },
}

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Per-card state: which card is updating, and which dropdown is open
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(null)

  // Single order lookup
  const [lookupId, setLookupId] = useState('')
  const [lookedUp, setLookedUp] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/orders')
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to load orders'); return }
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Update status
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    setDropdownOpen(null)
    try {
      const res = await fetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, deliveryStatus: newStatus } : o))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  // Delete order
  const handleDelete = async (orderId) => {
    if (!window.confirm(`Cancel and delete order ${orderId}?`)) return
    setDeletingId(orderId)
    try {
      const res = await fetch(`/orders/${orderId}`, { method: 'DELETE' })
      if (res.ok) setOrders(prev => prev.filter(o => o.orderId !== orderId))
    } finally {
      setDeletingId(null)
    }
  }

  // Lookup by ID
  const handleLookup = async () => {
    if (!lookupId.trim()) return
    setLookupLoading(true)
    setLookupError('')
    setLookedUp(null)
    try {
      const res = await fetch(`/orders/${lookupId.trim()}`)
      const data = await res.json()
      if (!res.ok) { setLookupError(data.error || 'Order not found'); return }
      setLookedUp(data)
    } catch {
      setLookupError('Network error.')
    } finally {
      setLookupLoading(false)
    }
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>My <span className="gradient-text">Orders</span></h2>
          <p>Manage, update, or cancel your orders.</p>
        </div>
        <button className="btn btn-outline" style={{ width: 'auto', padding: '10px 24px' }} onClick={fetchOrders}>
          🔄 Refresh
        </button>
      </div>

      {/* Lookup single order */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          🔍 Look Up Order by ID
        </h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            className="glass-input"
            placeholder="e.g. ORD1"
            value={lookupId}
            onChange={e => setLookupId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '12px 28px', flexShrink: 0 }}
            onClick={handleLookup}
            disabled={lookupLoading}
          >
            {lookupLoading ? 'Searching…' : 'Find'}
          </button>
        </div>
        {lookupError && <div className="error-msg" style={{ marginTop: '12px' }}>{lookupError}</div>}
        {lookedUp && (
          <div className="lookup-result">
            <div className="order-detail-row"><span>Order ID</span><span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{lookedUp.orderId}</span></div>
            <div className="order-detail-row"><span>Customer</span><span>{lookedUp.customerName}</span></div>
            <div className="order-detail-row"><span>Restaurant</span><span>{lookedUp.restaurantName}</span></div>
            <div className="order-detail-row"><span>Items</span><span>{lookedUp.foodItems.join(', ')}</span></div>
            <div className="order-detail-row"><span>Total</span><span className="price-text">${lookedUp.totalAmount.toFixed(2)}</span></div>
            <div className="order-detail-row">
              <span>Status</span>
              <span className={`status-chip ${STATUS_META[lookedUp.deliveryStatus]?.className}`}>
                {STATUS_META[lookedUp.deliveryStatus]?.emoji} {lookedUp.deliveryStatus}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* All orders */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <div className="spinner" />
          <p style={{ marginTop: '16px' }}>Loading orders…</p>
        </div>
      )}

      {!loading && error && (
        <div className="glass-card" style={{ textAlign: 'center', color: 'var(--method-delete)', padding: '40px' }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
          <p>No orders yet. Go place one!</p>
        </div>
      )}

      <div className="orders-grid">
        {orders.map(order => {
          const meta = STATUS_META[order.deliveryStatus] || {}
          const isUpdating = updatingId === order.orderId
          const isDeleting = deletingId === order.orderId
          const isOpen = dropdownOpen === order.orderId

          return (
            <div className="glass-card order-card" key={order._id}>
              {/* Card header */}
              <div className="order-card-header">
                <span className="order-id-badge">{order.orderId}</span>
                <span className={`status-chip ${meta.className}`}>
                  {meta.emoji} {order.deliveryStatus}
                </span>
              </div>

              {/* Details */}
              <div className="order-info">
                <div className="order-detail-row"><span>Customer</span><span>{order.customerName}</span></div>
                <div className="order-detail-row"><span>Restaurant</span><span>{order.restaurantName}</span></div>
                <div className="order-detail-row"><span>Total</span><span className="price-text">${order.totalAmount.toFixed(2)}</span></div>
              </div>

              {/* Food items */}
              <div className="food-items-list">
                {order.foodItems.map(item => (
                  <span key={item} className="food-pill">{item}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="order-actions">
                {/* Status dropdown */}
                <div className="dropdown-wrapper">
                  <button
                    className="btn btn-outline-sm"
                    onClick={() => setDropdownOpen(isOpen ? null : order.orderId)}
                    disabled={isUpdating || isDeleting}
                  >
                    {isUpdating ? 'Updating…' : '✏️ Update Status'}
                  </button>
                  {isOpen && (
                    <div className="dropdown-menu">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s}
                          className={`dropdown-item ${order.deliveryStatus === s ? 'current' : ''}`}
                          onClick={() => handleUpdateStatus(order.orderId, s)}
                        >
                          {STATUS_META[s]?.emoji} {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-danger-sm"
                  onClick={() => handleDelete(order.orderId)}
                  disabled={isUpdating || isDeleting}
                >
                  {isDeleting ? 'Deleting…' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrdersPage
