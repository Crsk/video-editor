import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TestRealComposition from './test-real-composition'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestRealComposition />
  </StrictMode>
)
