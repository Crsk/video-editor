import { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { CaptionAnimationConfig, CaptionAnimationValues } from '../../types/caption.types'
import { animationFunctions } from '../animations/animation-functions'
import { useCaptionAnimationContext } from '../../context/caption-animation-provider'

export const useCaptionAnimation = (
  durationInFrames: number,
  animationConfig?: CaptionAnimationConfig
): CaptionAnimationValues => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { animationType } = useCaptionAnimationContext()

  const config = useMemo(
    () => ({
      damping: animationConfig?.damping || 200,
      stiffness: animationConfig?.stiffness || 400,
      mass: animationConfig?.mass || 0.8
    }),
    [animationConfig]
  )

  const animationValues = useMemo(() => {
    const animationFunction = animationFunctions[animationType]

    if (!animationFunction) {
      // Fallback to bounce animation if animation type not found
      return animationFunctions.bounce({
        frame,
        durationInFrames,
        fps,
        config
      })
    }

    return animationFunction({
      frame,
      durationInFrames,
      fps,
      config
    })
  }, [frame, durationInFrames, fps, config, animationType])

  return animationValues
}
