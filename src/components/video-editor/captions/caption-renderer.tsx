import React from 'react'
import { AbsoluteFill } from 'remotion'
import { CaptionClip } from '../types'
import { CaptionStyle } from '../types/caption.types'
import { useCaptionAnimation } from './hooks/use-caption-animation'
import { useCaptionConfig } from './hooks/use-caption-config'
import { useCaptionAnimationContext } from '../context/caption-animation-provider'

interface CaptionRendererProps {
  clip: CaptionClip
  customStyle?: Partial<CaptionStyle>
}

export const CaptionRenderer: React.FC<CaptionRendererProps> = ({ clip, customStyle }) => {
  const { createCaptionStyle, animationConfig } = useCaptionConfig()
  const { scale, opacity, bounce, rotation } = useCaptionAnimation(clip.durationInFrames, animationConfig)
  const { effectivePosition } = useCaptionAnimationContext()

  const style = createCaptionStyle({
    color: clip.color,
    fontSize: clip.fontSize,
    fontWeight: clip.fontWeight,
    textAlign: clip.textAlign,
    positionY: clip.positionY,
    position: effectivePosition,
    ...customStyle
  })

  const getPositionStyles = (position: string) => {
    switch (position) {
      case 'top':
        return {
          top: '80px',
          bottom: 'auto',
          alignItems: 'flex-start'
        }
      case 'center':
        return {
          top: '50%',
          bottom: 'auto',
          alignItems: 'center'
        }
      case 'bottom':
      default:
        return {
          top: 'auto',
          bottom: style.positionY !== undefined ? `${style.positionY}px` : '80px',
          alignItems: 'flex-end'
        }
    }
  }

  const positionStyles = getPositionStyles(style.position)

  const renderStyle: React.CSSProperties = {
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    color: style.color,
    textAlign: style.textAlign,
    textShadow: style.textShadow,
    opacity,
    padding: style.padding,
    fontFamily: style.fontFamily,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
    maxWidth: style.maxWidth,
    position: 'absolute',
    left: '50%',
    transform: `translateX(-50%) scale(${scale}) translateY(${bounce}px) rotate(${rotation}deg)${
      style.position === 'center' ? ' translateY(-50%)' : ''
    }`,
    whiteSpace: style.whiteSpace,
    ...positionStyles
  }

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: positionStyles.alignItems,
        justifyContent: 'center',
        zIndex: 1000,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }}
    >
      <div style={renderStyle}>{clip.text}</div>
    </AbsoluteFill>
  )
}

export default CaptionRenderer
