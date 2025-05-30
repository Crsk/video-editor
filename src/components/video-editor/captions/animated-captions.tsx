import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { useCaptionAnimation } from './hooks/use-caption-animation'
import { useCaptionConfig } from './hooks/use-caption-config'
import { WordTimestamp } from '../types/caption.types'
import { useCaptionAnimationContext } from '../context/caption-animation-provider'

type AnimatedCaptionsProps = {
  words: WordTimestamp[]
}

export const AnimatedCaptions = ({ words }: AnimatedCaptionsProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { defaultStyle, animationConfig } = useCaptionConfig()
  const { effectivePosition } = useCaptionAnimationContext()

  const currentTime = frame / fps
  const currentWord = words.find(word => currentTime >= word.start && currentTime <= word.end)

  if (!currentWord) return null

  const wordDuration = currentWord.end - currentWord.start
  const wordDurationFrames = Math.round(wordDuration * fps)
  const { scale, opacity, bounce, rotation } = useCaptionAnimation(wordDurationFrames, animationConfig)

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
          bottom: '80px',
          alignItems: 'flex-end'
        }
    }
  }

  const positionStyles = getPositionStyles(effectivePosition)

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: positionStyles.alignItems,
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          fontSize: defaultStyle.fontSize,
          fontWeight: defaultStyle.fontWeight,
          color: defaultStyle.color,
          textAlign: defaultStyle.textAlign,
          textShadow: defaultStyle.textShadow,
          opacity,
          padding: defaultStyle.padding,
          fontFamily: defaultStyle.fontFamily,
          letterSpacing: defaultStyle.letterSpacing,
          textTransform: defaultStyle.textTransform,
          position: 'absolute',
          left: '50%',
          transform: `translateX(-50%) scale(${scale}) translateY(${bounce}px) rotate(${rotation}deg)${
            effectivePosition === 'center' ? ' translateY(-50%)' : ''
          }`,
          ...positionStyles
        }}
      >
        {currentWord.word}
      </div>
    </AbsoluteFill>
  )
}
