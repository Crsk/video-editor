import React from 'react'
import { AbsoluteFill } from 'remotion'
import { CaptionClip } from '../types'
import { CaptionStyle } from '../types/caption.types'
import { useCaptionAnimation } from './hooks/use-caption-animation'
import { useCaptionConfig } from './hooks/use-caption-config'

interface CaptionRendererProps {
  clip: CaptionClip
  customStyle?: Partial<CaptionStyle>
}

export const CaptionRenderer: React.FC<CaptionRendererProps> = ({ clip, customStyle }) => {
  const { createCaptionStyle, animationConfig } = useCaptionConfig()
  const { scale, opacity, bounce } = useCaptionAnimation(clip.durationInFrames, animationConfig)

  const style = createCaptionStyle({
    color: clip.color,
    fontSize: clip.fontSize,
    fontWeight: clip.fontWeight,
    textAlign: clip.textAlign,
    positionY: clip.positionY,
    ...customStyle
  })

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
    bottom: style.positionY !== undefined ? `${style.positionY}px` : '80px',
    left: '50%',
    transform: `translateX(-50%) scale(${scale}) translateY(${bounce}px)`,
    whiteSpace: style.whiteSpace
  }

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
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
