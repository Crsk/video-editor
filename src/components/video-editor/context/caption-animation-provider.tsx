import React, { createContext, useContext, useState, ReactNode } from 'react'
import { CaptionAnimationType } from '../types/caption.types'

interface CaptionAnimationContextType {
  animationType: CaptionAnimationType
  setAnimationType: (type: CaptionAnimationType) => void
}

const CaptionAnimationContext = createContext<CaptionAnimationContextType | undefined>(undefined)

interface CaptionAnimationProviderProps {
  children: ReactNode
}

export const CaptionAnimationProvider: React.FC<CaptionAnimationProviderProps> = ({ children }) => {
  const [animationType, setAnimationType] = useState<CaptionAnimationType>('bounce')

  return (
    <CaptionAnimationContext.Provider
      value={{
        animationType,
        setAnimationType
      }}
    >
      {children}
    </CaptionAnimationContext.Provider>
  )
}

export const useCaptionAnimationContext = () => {
  const context = useContext(CaptionAnimationContext)
  if (context === undefined) {
    throw new Error('useCaptionAnimationContext must be used within a CaptionAnimationProvider')
  }
  return context
}
