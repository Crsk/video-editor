import { useMemo } from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { CaptionAnimationConfig } from '../../types/caption.types'

interface CaptionAnimationValues {
  scale: number
  opacity: number
  bounce: number
}

export const useCaptionAnimation = (
  durationInFrames: number,
  animationConfig?: CaptionAnimationConfig
): CaptionAnimationValues => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const config = useMemo(
    () => ({
      damping: animationConfig?.damping || 200,
      stiffness: animationConfig?.stiffness || 400,
      mass: animationConfig?.mass || 0.8
    }),
    [animationConfig]
  )

  const animationValues = useMemo(() => {
    const relativeFrame = frame
    const wordProgress = relativeFrame / durationInFrames

    const entranceAnimation = spring({
      frame: relativeFrame,
      fps,
      config
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

    return { scale, opacity, bounce }
  }, [frame, durationInFrames, fps, config])

  return animationValues
}
