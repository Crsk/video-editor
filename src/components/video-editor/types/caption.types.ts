export type CaptionPosition = 'top' | 'center' | 'bottom'

export type CaptionStyle = {
  color: string
  fontSize: number
  fontWeight: number
  textAlign: 'left' | 'center' | 'right'
  position: CaptionPosition
  positionY: number
  fontFamily?: string
  letterSpacing?: string
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textShadow?: string
  padding?: string
  maxWidth?: string
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap'
}

export type CaptionAnimationConfig = {
  damping: number
  stiffness: number
  mass: number
}

export type CaptionAnimationType = 'subtle' | 'wave' | 'shake' | 'zoom' | 'swing' | 'elastic' | 'glitch'

export interface CaptionAnimationValues {
  scale: number
  opacity: number
  bounce: number
  rotation: number
}

export type CaptionConfig = {
  defaultStyle: CaptionStyle
  animation: CaptionAnimationConfig
  animationType: CaptionAnimationType
  fps: number
}

export type WordTimestamp = {
  word: string
  start: number
  end: number
}

export type CaptionClipData = {
  id: string
  type: 'caption'
  from: number
  durationInFrames: number
  text: string
  style?: Partial<CaptionStyle>
}

export type CaptionTrackConfig = {
  name: string
  volume: number
  type: 'caption'
}
