import { useState, useEffect, useCallback } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import PlaceOrderPage from './pages/PlaceOrderPage'
import OrdersPage from './pages/OrdersPage'
import ManageRestaurantsPage from './pages/ManageRestaurantsPage'
import { INITIAL_RESTAURANTS } from './data/initialRestaurants'

// Valid page keys
const PAGES = ['home', 'place-order', 'orders', 'manage-restaurants']

function getInitialPage() {
  const hash = window.location.hash.replace('#', '')
  return PAGES.includes(hash) ? hash : 'home'
}

function App() {
  const [page, setPageState] = useState(getInitialPage)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  // Restaurants state (loaded from localStorage or initialized)
  const [restaurants, setRestaurants] = useState(() => {
    try {
      const saved = localStorage.getItem('food_delivery_restaurants')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load restaurants from localStorage', e)
    }
    return INITIAL_RESTAURANTS
  })

  // Save restaurants to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('food_delivery_restaurants', JSON.stringify(restaurants))
    } catch (e) {
      console.error('Failed to save restaurants to localStorage', e)
    }
  }, [restaurants])

  // Restaurant management handlers
  const handleAddRestaurant = (newRest) => {
    setRestaurants(prev => [...prev, newRest])
  }

  const handleAddDish = (restId, newDish) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id === restId) {
        // Prevent duplicate dish names for the same restaurant
        const exists = rest.menu.some(d => d.name.toLowerCase() === newDish.name.toLowerCase())
        if (exists) {
          return {
            ...rest,
            menu: rest.menu.map(d => d.name.toLowerCase() === newDish.name.toLowerCase() ? newDish : d)
          }
        }
        return {
          ...rest,
          menu: [...rest.menu, newDish]
        }
      }
      return rest
    }))
  }

  const handleDeleteDish = (restId, dishName) => {
    setRestaurants(prev => prev.map(rest => {
      if (rest.id === restId) {
        return {
          ...rest,
          menu: rest.menu.filter(d => d.name !== dishName)
        }
      }
      return rest
    }))
  }

  const handleDeleteRestaurant = (restId) => {
    setRestaurants(prev => prev.filter(rest => rest.id !== restId))
  }

  // Navigate: update state + push a browser history entry
  const setPage = useCallback((newPage) => {
    setPageState(newPage)
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
      {page === 'home'               && <HomePage setPage={setPage} />}
      {page === 'place-order'        && <PlaceOrderPage setPage={setPage} restaurants={restaurants} />}
      {page === 'orders'             && <OrdersPage restaurants={restaurants} />}
      {page === 'manage-restaurants' && (
        <ManageRestaurantsPage
          restaurants={restaurants}
          onAddRestaurant={handleAddRestaurant}
          onAddDish={handleAddDish}
          onDeleteDish={handleDeleteDish}
          onDeleteRestaurant={handleDeleteRestaurant}
        />
      )}
    </>
  )
}

export default App
