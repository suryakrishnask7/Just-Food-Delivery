import { useState, useEffect, useCallback, useMemo } from 'react'

const STATUS_OPTIONS = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']

const STATUS_META = {
  'Placed':           { className: 'placed',    emoji: '🕐' },
  'Preparing':        { className: 'preparing', emoji: '👨‍🍳' },
  'Out for Delivery': { className: 'delivery',  emoji: '🛵' },
  'Delivered':        { className: 'delivered', emoji: '✅' },
  'Cancelled':        { className: 'cancelled', emoji: '❌' },
}

const TERMINAL = new Set(['Delivered', 'Cancelled'])

// Collapse repeated food items into "Burger ×2" style
function collapsePills(items) {
  const counts = {}
  items.forEach(i => { counts[i] = (counts[i] || 0) + 1 })
  return Object.entries(counts).map(([name, qty]) => ({ name, qty }))
}

// Restaurant emojis map (synced with PlaceOrderPage)
const RESTAURANT_EMOJI = {
  'Burger Joint':     '🍔',
  'Pizza Haven':      '🍕',
  'Sushi World':      '🍣',
  'Biryani Palace':   '🍛',
}

function OrdersPage() {
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [activeRestaurant, setActiveRestaurant] = useState('All')

  // Per-card UI state
  const [updatingId, setUpdatingId]   = useState(null)
  const [deletingId, setDeletingId]   = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(null)

  // ── Fetch ──
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/orders')
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

  // ── Close dropdown when clicking outside ──
  useEffect(() => {
    const close = () => setDropdownOpen(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  // ── Derived: unique restaurants found in orders ──
  const restaurants = useMemo(() => {
    const names = [...new Set(orders.map(o => o.restaurantName))]
    return names.sort()
  }, [orders])

  // ── Stats per restaurant ──
  const restaurantStats = useMemo(() => {
    const stats = {}
    orders.forEach(o => {
      if (!stats[o.restaurantName]) stats[o.restaurantName] = { total: 0, active: 0 }
      stats[o.restaurantName].total++
      if (!TERMINAL.has(o.deliveryStatus)) stats[o.restaurantName].active++
    })
    return stats
  }, [orders])

  // ── Filtered orders ──
  const filtered = useMemo(() => {
    if (activeRestaurant === 'All') return orders
    return orders.filter(o => o.restaurantName === activeRestaurant)
  }, [orders, activeRestaurant])

  // ── Actions ──
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
        setOrders(prev => prev.map(o =>
          o.orderId === orderId ? { ...o, deliveryStatus: newStatus } : o
        ))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (orderId) => {
    if (!window.confirm(`Delete order ${orderId}?`)) return
    setDeletingId(orderId)
    try {
      const res = await fetch(`/orders/${orderId}`, { method: 'DELETE' })
      if (res.ok) setOrders(prev => prev.filter(o => o.orderId !== orderId))
    } finally {
      setDeletingId(null)
    }
  }

  // ── Summary counts ──
  const activeCount  = orders.filter(o => !TERMINAL.has(o.deliveryStatus)).length
  const doneCount    = orders.filter(o => TERMINAL.has(o.deliveryStatus)).length

  return (
    <div className="container">

      {/* ── Page header ── */}
      <div className="page-header dash-header">
        <div>
          <h2>Orders <span className="gradient-text">Dashboard</span></h2>
          <p>Filter by restaurant, update statuses, or remove orders.</p>
        </div>
        <button className="btn btn-outline" style={{ width: 'auto', padding: '10px 24px' }} onClick={fetchOrders}>
          🔄 Refresh
        </button>
      </div>

      {/* ── Stats bar ── */}
      {!loading && !error && (
        <div className="stats-bar">
          <div className="stat-pill">
            <span className="stat-label">Total</span>
            <span className="stat-value">{orders.length}</span>
          </div>
          <div className="stat-pill active">
            <span className="stat-label">Active</span>
            <span className="stat-value">{activeCount}</span>
          </div>
          <div className="stat-pill done">
            <span className="stat-label">Done</span>
            <span className="stat-value">{doneCount}</span>
          </div>
        </div>
      )}

      {/* ── Restaurant filter tabs ── */}
      {!loading && restaurants.length > 0 && (
        <div className="restaurant-tabs">
          {/* All tab */}
          <button
            className={`rest-tab ${activeRestaurant === 'All' ? 'active' : ''}`}
            onClick={() => setActiveRestaurant('All')}
          >
            <span className="rest-tab-emoji">🍽️</span>
            <span className="rest-tab-name">All</span>
            <span className="rest-tab-count">{orders.length}</span>
          </button>

          {/* Per-restaurant tabs */}
          {restaurants.map(name => (
            <button
              key={name}
              className={`rest-tab ${activeRestaurant === name ? 'active' : ''}`}
              onClick={() => setActiveRestaurant(name)}
            >
              <span className="rest-tab-emoji">{RESTAURANT_EMOJI[name] || '🍴'}</span>
              <span className="rest-tab-name">{name}</span>
              <span className="rest-tab-count">{restaurantStats[name]?.total || 0}</span>
              {restaurantStats[name]?.active > 0 && (
                <span className="rest-tab-active-dot" title={`${restaurantStats[name].active} active`} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Loading / error / empty ── */}
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

      {!loading && !error && filtered.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
            {activeRestaurant === 'All' ? '🛒' : RESTAURANT_EMOJI[activeRestaurant] || '🍴'}
          </div>
          <p>
            {activeRestaurant === 'All'
              ? 'No orders yet. Go place one!'
              : `No orders from ${activeRestaurant} yet.`}
          </p>
        </div>
      )}

      {/* ── Orders grid ── */}
      <div className="orders-grid">
        {filtered.map(order => {
          const meta      = STATUS_META[order.deliveryStatus] || {}
          const isTerminal = TERMINAL.has(order.deliveryStatus)
          const isUpdating = updatingId === order.orderId
          const isDeleting = deletingId === order.orderId
          const isOpen     = dropdownOpen === order.orderId
          const pills      = collapsePills(order.foodItems)

          return (
            <div
              className={`glass-card order-card ${isTerminal ? 'order-card--faded' : ''}`}
              key={order._id}
            >
              {/* Card header */}
              <div className="order-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="order-id-badge">{order.orderId}</span>
                  <span className="order-rest-label">
                    {RESTAURANT_EMOJI[order.restaurantName] || '🍴'} {order.restaurantName}
                  </span>
                </div>
                <span className={`status-chip ${meta.className}`}>
                  {meta.emoji} {order.deliveryStatus}
                </span>
              </div>

              {/* Details */}
              <div className="order-info">
                <div className="order-detail-row">
                  <span>Customer</span><span>{order.customerName}</span>
                </div>
                <div className="order-detail-row">
                  <span>Total</span>
                  <span className={isTerminal ? '' : 'price-text'}>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Food pills — collapsed */}
              <div className="food-items-list">
                {pills.map(({ name, qty }) => (
                  <span key={name} className="food-pill">
                    {name}{qty > 1 && <strong> ×{qty}</strong>}
                  </span>
                ))}
              </div>

              {/* Actions — hidden for terminal orders */}
              {isTerminal ? (
                <div className="order-terminal-bar">
                  <span>{order.deliveryStatus === 'Delivered' ? '✅ Order delivered' : '❌ Order cancelled'}</span>
                  <button
                    className="btn btn-danger-sm"
                    onClick={() => handleDelete(order.orderId)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Removing…' : '🗑️ Remove'}
                  </button>
                </div>
              ) : (
                <div className="order-actions">
                  {/* Status dropdown */}
                  <div className="dropdown-wrapper">
                    <button
                      className="btn btn-outline-sm"
                      onClick={(e) => { e.stopPropagation(); setDropdownOpen(isOpen ? null : order.orderId) }}
                      disabled={isUpdating || isDeleting}
                    >
                      {isUpdating ? 'Updating…' : '✏️ Update Status'}
                    </button>
                    {isOpen && (
                      <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrdersPage
