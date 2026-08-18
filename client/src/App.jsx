import { useState, useEffect, useCallback } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import PlaceOrderPage from './pages/PlaceOrderPage'
import OrdersPage from './pages/OrdersPage'

// Valid page keys
const PAGES = ['home', 'place-order', 'orders']

function getInitialPage() {
  const hash = window.location.hash.replace('#', '')
  return PAGES.includes(hash) ? hash : 'home'
}

function App() {
  const [page, setPageState] = useState(getInitialPage)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  // Navigate: update state + push a browser history entry
  const setPage = useCallback((newPage) => {
    setPageState(newPage)
    // Only push if it's a real navigation (not already on that page)
    if (window.location.hash !== `#${newPage}`) {
      window.history.pushState({ page: newPage }, '', `#${newPage}`)
    }
  }, [])

  // Listen for browser back/forward button presses
  useEffect(() => {
    const handlePopState = (e) => {
      const target = e.state?.page || getInitialPage()
      setPageState(target)
    }
    window.addEventListener('popstate', handlePopState)
    // Seed the very first history entry so back works from page 1 too
    window.history.replaceState({ page: getInitialPage() }, '', window.location.hash || '#home')
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Theme
  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <>
      <Navbar page={page} setPage={setPage} theme={theme} toggleTheme={toggleTheme} />
      {page === 'home'        && <HomePage setPage={setPage} />}
      {page === 'place-order' && <PlaceOrderPage setPage={setPage} />}
      {page === 'orders'      && <OrdersPage />}
    </>
  )
}

export default App
