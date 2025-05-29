import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

type Word = {
  word: string
  start: number
  end: number
}

type AnimatedCaptionsProps = {
  words: Word[]
}

export const AnimatedCaptions = ({ words }: AnimatedCaptionsProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps
  const currentWord = words.find(word => currentTime >= word.start && currentTime <= word.end)

  if (!currentWord) return null

  const wordDuration = currentWord.end - currentWord.start
  const wordProgress = (currentTime - currentWord.start) / wordDuration
  const entranceAnimation = spring({
    frame: frame - currentWord.start * fps,
    fps,
    config: {
      damping: 200,
      stiffness: 400,
      mass: 0.8
    }
  })

  const scale = interpolate(entranceAnimation, [0, 1], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const opacity = interpolate(wordProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const bounce = interpolate(entranceAnimation, [0, 0.5, 1], [0, -5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

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
          fontSize: 56,
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
          textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)',
          transform: `scale(${scale}) translateY(${bounce}px)`,
          opacity,
          padding: '24px 48px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.02em',
          textTransform: 'uppercase'
        }}
      >
        {currentWord.word}
      </div>
    </AbsoluteFill>
  )
}
