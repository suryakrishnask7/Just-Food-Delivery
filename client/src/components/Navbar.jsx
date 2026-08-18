function Navbar({ page, setPage, theme, toggleTheme }) {
  return (
    <nav className="navbar">
      <span className="logo" onClick={() => setPage('home')}>
        🚀 Just Food Delivery
      </span>
      <div className="nav-links">
        <button
          className={`nav-link ${page === 'place-order' ? 'active' : ''}`}
          onClick={() => setPage('place-order')}
        >
          Place Order
        </button>
        <button
          className={`nav-link ${page === 'orders' ? 'active' : ''}`}
          onClick={() => setPage('orders')}
        >
          My Orders
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
