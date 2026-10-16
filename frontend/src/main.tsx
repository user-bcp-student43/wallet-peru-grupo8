import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createOnboardingService } from './services/onboardingService'
import './index.css'
import App from './App.tsx'

const onboardingService = createOnboardingService()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App service={onboardingService} />
  </StrictMode>,
)
