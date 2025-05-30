import { interpolate, spring } from 'remotion'
import { CaptionAnimationValues, CaptionAnimationConfig, CaptionAnimationType } from '../../types/caption.types'

export interface AnimationParams {
  frame: number
  durationInFrames: number
  fps: number
  config: CaptionAnimationConfig
}

export type AnimationFunction = (params: AnimationParams) => CaptionAnimationValues

export const subtleAnimation: AnimationFunction = ({ frame, durationInFrames, fps, config }) => {
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

export const shakeAnimation: AnimationFunction = ({ frame, durationInFrames }) => {
  const relativeFrame = frame
  const wordProgress = relativeFrame / durationInFrames

  const shakeIntensity = interpolate(wordProgress, [0, 0.2, 0.8, 1], [0, 8, 8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const shake = Math.sin(relativeFrame * 0.8) * shakeIntensity
  const rotation = Math.sin(relativeFrame * 0.6) * 2

  const opacity = interpolate(wordProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  return { scale: 1, opacity, bounce: shake, rotation }
}

export const zoomAnimation: AnimationFunction = ({ frame, durationInFrames, fps, config }) => {
  const relativeFrame = frame
  const wordProgress = relativeFrame / durationInFrames

  const entranceAnimation = spring({
    frame: relativeFrame,
    fps,
    config: { ...config, stiffness: 300, damping: 25 }
  })

  const scale = interpolate(entranceAnimation, [0, 1], [0.1, 1.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const opacity = interpolate(wordProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  return { scale, opacity, bounce: 0, rotation: 0 }
}

export const swingAnimation: AnimationFunction = ({ frame, durationInFrames }) => {
  const relativeFrame = frame
  const wordProgress = relativeFrame / durationInFrames
  const swingProgress = Math.sin(wordProgress * Math.PI * 3) * Math.exp(-wordProgress * 3)
  const rotation = swingProgress * 25

  const scale = interpolate(wordProgress, [0, 0.2, 1], [0.8, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const opacity = interpolate(wordProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  return { scale, opacity, bounce: 0, rotation }
}

export const elasticAnimation: AnimationFunction = ({ frame, durationInFrames, fps, config }) => {
  const relativeFrame = frame
  const wordProgress = relativeFrame / durationInFrames

  const entranceAnimation = spring({
    frame: relativeFrame,
    fps,
    config: { ...config, stiffness: 150, damping: 8, mass: 0.3 }
  })

  const scale = interpolate(entranceAnimation, [0, 1], [0.3, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'extend'
  })

  const elasticBounce = Math.sin(wordProgress * Math.PI * 8) * Math.exp(-wordProgress * 4) * 10

  const opacity = interpolate(wordProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  return { scale, opacity, bounce: elasticBounce, rotation: 0 }
}

export const glitchAnimation: AnimationFunction = ({ frame, durationInFrames }) => {
  const relativeFrame = frame
  const wordProgress = relativeFrame / durationInFrames

  const chaos1 = Math.sin(relativeFrame * 0.23) * Math.cos(relativeFrame * 0.17)
  const chaos2 = Math.sin(relativeFrame * 0.31) * Math.sin(relativeFrame * 0.19)
  const chaos3 = Math.cos(relativeFrame * 0.41) * Math.sin(relativeFrame * 0.13)
  const chaos4 = Math.sin(relativeFrame * 0.47) * Math.cos(relativeFrame * 0.29)

  const mainGlitch = Math.sin(relativeFrame * 0.07) > 0.3 ? 1 : 0 // More frequent (was 0.7)
  const microGlitch = Math.sin(relativeFrame * 0.23) > 0.6 ? 1 : 0 // Additional micro glitches
  const megaGlitch = Math.sin(relativeFrame * 0.03) > 0.85 ? 1 : 0 // Rare mega glitches

  const baseIntensity = interpolate(wordProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const glitchIntensity = baseIntensity * (mainGlitch * 1.0 + microGlitch * 0.5 + megaGlitch * 2.0) // Mega glitches are twice as intense

  const scaleBase = 1
  const scaleGlitch = scaleBase + chaos1 * 0.4 * glitchIntensity // Increased from 0.1 to 0.4
  const megaScaleGlitch = megaGlitch ? scaleBase + chaos2 * 0.8 : scaleBase // Mega scale distortion
  const finalScale = Math.max(0.2, Math.min(2.5, scaleGlitch * megaScaleGlitch)) // Clamp extreme values

  const bounceGlitch = chaos2 * 35 * glitchIntensity // Increased from 15 to 35
  const megaBounce = megaGlitch ? chaos3 * 60 : 0 // Additional mega bounce
  const finalBounce = bounceGlitch + megaBounce

  const rotationGlitch = chaos1 * 15 * glitchIntensity // Increased from 5 to 15
  const megaRotation = megaGlitch ? chaos4 * 45 : 0 // Mega rotation spins
  const finalRotation = rotationGlitch + megaRotation

  let opacity = interpolate(wordProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  const flickerGlitch = Math.sin(relativeFrame * 0.53) > 0.8 ? 0.3 : 1 // Occasional flickers
  const megaFlicker = megaGlitch && Math.sin(relativeFrame * 0.71) > 0.5 ? 0.1 : 1 // Mega flickers
  opacity = opacity * flickerGlitch * megaFlicker

  return {
    scale: finalScale,
    opacity: 1,
    bounce: finalBounce,
    rotation: finalRotation
  }
}

export const animationFunctions: Record<CaptionAnimationType, AnimationFunction> = {
  subtle: subtleAnimation,
  wave: waveAnimation,
  shake: shakeAnimation,
  zoom: zoomAnimation,
  swing: swingAnimation,
  elastic: elasticAnimation,
  glitch: glitchAnimation
}
