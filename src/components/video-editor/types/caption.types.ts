export type CaptionStyle = {
  color: string
  fontSize: number
  fontWeight: number
  textAlign: 'left' | 'center' | 'right'
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

export type CaptionConfig = {
  defaultStyle: CaptionStyle
  animation: CaptionAnimationConfig
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
