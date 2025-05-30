import { useMemo } from 'react'
import { CaptionStyle, CaptionAnimationConfig, CaptionConfig } from '../../types/caption.types'

export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  color: '#ffffff',
  fontSize: 56,
  fontWeight: 900,
  textAlign: 'center',
  position: 'bottom',
  positionY: 80,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)',
  padding: '24px 48px',
  maxWidth: '90%',
  whiteSpace: 'nowrap'
}

export const DEFAULT_ANIMATION_CONFIG: CaptionAnimationConfig = {
  damping: 200,
  stiffness: 400,
  mass: 0.8
}

export const useCaptionConfig = (customConfig?: Partial<CaptionConfig>) => {
  const config = useMemo(
    (): CaptionConfig => ({
      defaultStyle: {
        ...DEFAULT_CAPTION_STYLE,
        ...customConfig?.defaultStyle
      },
      animation: {
        ...DEFAULT_ANIMATION_CONFIG,
        ...customConfig?.animation
      },
      animationType: customConfig?.animationType || 'subtle',
      fps: customConfig?.fps || 30
    }),
    [customConfig]
  )

  const createCaptionStyle = (overrides?: Partial<CaptionStyle>): CaptionStyle => {
    return {
      ...config.defaultStyle,
      ...overrides
    }
  }

  return {
    config,
    createCaptionStyle,
    defaultStyle: config.defaultStyle,
    animationConfig: config.animation,
    animationType: config.animationType,
    fps: config.fps
  }
}
