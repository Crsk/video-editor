import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { useCaptionAnimation } from './hooks/use-caption-animation'
import { useCaptionConfig } from './hooks/use-caption-config'
import { WordTimestamp } from '../types/caption.types'

type AnimatedCaptionsProps = {
  words: WordTimestamp[]
}

export const AnimatedCaptions = ({ words }: AnimatedCaptionsProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { defaultStyle, animationConfig } = useCaptionConfig()

  const currentTime = frame / fps
  const currentWord = words.find(word => currentTime >= word.start && currentTime <= word.end)

  if (!currentWord) return null

  const wordDuration = currentWord.end - currentWord.start
  const wordDurationFrames = Math.round(wordDuration * fps)
  const { scale, opacity, bounce } = useCaptionAnimation(wordDurationFrames, animationConfig)

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
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
          transform: `scale(${scale}) translateY(${bounce}px)`,
          opacity,
          padding: defaultStyle.padding,
          fontFamily: defaultStyle.fontFamily,
          letterSpacing: defaultStyle.letterSpacing,
          textTransform: defaultStyle.textTransform
        }}
      >
        {currentWord.word}
      </div>
    </AbsoluteFill>
  )
}
