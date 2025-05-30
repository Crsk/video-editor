import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { CaptionAnimationType, CaptionPosition } from '../types/caption.types'

interface CaptionAnimationContextType {
  animationType: CaptionAnimationType
  setAnimationType: (type: CaptionAnimationType) => void
  previewAnimationType: CaptionAnimationType | null
  setPreviewAnimationType: (type: CaptionAnimationType | null) => void
  effectiveAnimationType: CaptionAnimationType
  position: CaptionPosition
  setPosition: (position: CaptionPosition) => void
  previewPosition: CaptionPosition | null
  setPreviewPosition: (position: CaptionPosition | null) => void
  effectivePosition: CaptionPosition
}

const CaptionAnimationContext = createContext<CaptionAnimationContextType | undefined>(undefined)

interface CaptionAnimationProviderProps {
  children: ReactNode
}

export const CaptionAnimationProvider: React.FC<CaptionAnimationProviderProps> = ({ children }) => {
  const [animationType, setAnimationType] = useState<CaptionAnimationType>('subtle')
  const [previewAnimationType, setPreviewAnimationType] = useState<CaptionAnimationType | null>(null)
  const [position, setPosition] = useState<CaptionPosition>('bottom')
  const [previewPosition, setPreviewPosition] = useState<CaptionPosition | null>(null)

  const effectiveAnimationType = useMemo(() => {
    return previewAnimationType || animationType
  }, [previewAnimationType, animationType])

  const effectivePosition = useMemo(() => {
    return previewPosition || position
  }, [previewPosition, position])

  return (
    <CaptionAnimationContext.Provider
      value={{
        animationType,
        setAnimationType,
        previewAnimationType,
        setPreviewAnimationType,
        effectiveAnimationType,
        position,
        setPosition,
        previewPosition,
        setPreviewPosition,
        effectivePosition
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
