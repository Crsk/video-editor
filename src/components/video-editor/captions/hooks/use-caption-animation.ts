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
  const { effectiveAnimationType } = useCaptionAnimationContext()

  const config = useMemo(
    () => ({
      damping: animationConfig?.damping || 200,
      stiffness: animationConfig?.stiffness || 400,
      mass: animationConfig?.mass || 0.8
    }),
    [animationConfig]
  )

  const animationValues = useMemo(() => {
    const animationFunction = animationFunctions[effectiveAnimationType]

    if (!animationFunction) {
      // Fallback to subtle animation if animation type not found
      return animationFunctions.subtle({
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
  }, [frame, durationInFrames, fps, config, effectiveAnimationType])

  return animationValues
}
