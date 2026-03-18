import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Clear previous session so the app always starts from the login page
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
localStorage.removeItem('user')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
