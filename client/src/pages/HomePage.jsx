function HomePage({ setPage }) {
  return (
    <>
      <main className="hero">
        <h1>
          Hungry? <br />
          <span className="gradient-text">Order in seconds.</span>
        </h1>
        <p>
          Fast, reliable food delivery from your favourite restaurants.
          Track every order in real time from placement to doorstep.
        </p>
        <button
          className="btn btn-primary"
          style={{ width: 'auto', padding: '14px 40px', margin: '0 auto' }}
          onClick={() => setPage('place-order')}
        >
          Order Now →
        </button>
      </main>

      <section className="features">
        <div className="glass-card feature-card" onClick={() => setPage('place-order')}>
          <div className="feature-icon">🍔</div>
          <h3>Place an Order</h3>
          <p>
            Choose your restaurant, pick your food items, and submit your order
            in just a few clicks.
          </p>
          <span className="btn btn-primary" style={{ marginTop: 'auto' }}>
            Start Ordering →
          </span>
        </div>

        <div className="glass-card feature-card" onClick={() => setPage('orders')}>
          <div className="feature-icon">📦</div>
          <h3>Track My Orders</h3>
          <p>
            View all your orders, update delivery status, or cancel an order
            — all in one clean dashboard.
          </p>
          <span className="btn btn-primary" style={{ marginTop: 'auto' }}>
            View Orders →
          </span>
        </div>
      </section>
    </>
  )
}

export default HomePage
