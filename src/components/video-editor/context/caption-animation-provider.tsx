import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { CaptionAnimationType } from '../types/caption.types'

interface CaptionAnimationContextType {
  animationType: CaptionAnimationType
  setAnimationType: (type: CaptionAnimationType) => void
  previewAnimationType: CaptionAnimationType | null
  setPreviewAnimationType: (type: CaptionAnimationType | null) => void
  effectiveAnimationType: CaptionAnimationType
}

const CaptionAnimationContext = createContext<CaptionAnimationContextType | undefined>(undefined)

interface CaptionAnimationProviderProps {
  children: ReactNode
}

export const CaptionAnimationProvider: React.FC<CaptionAnimationProviderProps> = ({ children }) => {
  const [animationType, setAnimationType] = useState<CaptionAnimationType>('subtle')
  const [previewAnimationType, setPreviewAnimationType] = useState<CaptionAnimationType | null>(null)

  const effectiveAnimationType = useMemo(() => {
    return previewAnimationType || animationType
  }, [previewAnimationType, animationType])

  return (
    <CaptionAnimationContext.Provider
      value={{
        animationType,
        setAnimationType,
        previewAnimationType,
        setPreviewAnimationType,
        effectiveAnimationType
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
