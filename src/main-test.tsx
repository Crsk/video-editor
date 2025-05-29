import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App'
import TestHTML5App from './test-html5'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestHTML5App />
  </StrictMode>
)
