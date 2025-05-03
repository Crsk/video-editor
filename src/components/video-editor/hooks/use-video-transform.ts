import { VideoClip } from '../types'

interface VideoTransform {
  zoomScale: number
  translateX: string
  translateY: string
  objectPositionX: string
  objectPositionY: string
  finalVolume: number
  transform: string
  objectPosition: string
}

export function useVideoTransform() {
  const getVideoTransform = (clip: VideoClip, trackVolume = 1): VideoTransform => {
    // Handle volume
    const clipVolume = clip.volume !== undefined ? clip.volume : 1
    const finalVolume = trackVolume * clipVolume
    
    // Handle position
    const positionX = clip.positionX || 0
    const positionY = clip.positionY || 0
    
    // Handle zoom
    const zoomValue = clip.zoom !== undefined ? clip.zoom : 0
    
    // Convert from -100 to 100 range to 0.5 to 2.0 scale factor
    // 0 -> 1.0 (no zoom), -100 -> 0.5 (zoom out), 100 -> 2.0 (zoom in)
    const zoomScale = 1 + (zoomValue / 100)
    
    // Calculate translations for positioning
    const translateX = `${positionX / 10}%`
    const translateY = `${positionY / 10}%`
    
    // Calculate object-position for cover mode
    // Convert from -100/100 range to 0-100% range for CSS object-position
    const objectPositionX = `${50 + positionX / 2}%`
    const objectPositionY = `${50 + positionY / 2}%`
    
    // Combine transformations
    const transform = `translate(${translateX}, ${translateY}) scale(${zoomScale})`
    const objectPosition = `${objectPositionX} ${objectPositionY}`
    
    return {
      zoomScale,
      translateX,
      translateY,
      objectPositionX,
      objectPositionY,
      finalVolume,
      transform,
      objectPosition
    }
  }
  
  return {
    getVideoTransform
  }
}
