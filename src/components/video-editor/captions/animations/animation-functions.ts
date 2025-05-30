import { interpolate, spring } from 'remotion'
import { CaptionAnimationValues, CaptionAnimationConfig, CaptionAnimationType } from '../../types/caption.types'

export interface AnimationParams {
  frame: number
  durationInFrames: number
  fps: number
  config: CaptionAnimationConfig
}

export type AnimationFunction = (params: AnimationParams) => CaptionAnimationValues

export const bounceAnimation: AnimationFunction = ({ frame, durationInFrames, fps, config }) => {
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

  return { scale, opacity, bounce, rotation: 0 }
}

export const waveAnimation: AnimationFunction = ({ frame, durationInFrames }) => {
  const relativeFrame = frame
  const wordProgress = relativeFrame / durationInFrames

  // Similar to the provided example code
  const scale = 0.8 + 0.4 * Math.sin(wordProgress * Math.PI)
  const rotation = Math.sin(wordProgress * Math.PI * 4) * 1

  const opacity = interpolate(wordProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const bounce = 0 // No bounce for this animation

  return { scale, opacity, bounce, rotation }
}

export const animationFunctions: Record<CaptionAnimationType, AnimationFunction> = {
  bounce: bounceAnimation,
  wave: waveAnimation
}
