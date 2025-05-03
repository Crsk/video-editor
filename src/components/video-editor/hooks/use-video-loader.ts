import { useEffect } from 'react'
import type { Track } from '../types'

const FPS = 30

/**
 * Hook for loading videos and calculating their durations
 *
 * @param tracks - The current tracks state
 * @param setTracks - Function to update tracks state
 * @param setOriginalVideoDuration - Function to set the original video duration
 */
export const useVideoLoader = (
  tracks: Track[],
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>,
  setOriginalVideoDuration: React.Dispatch<React.SetStateAction<number | null>>
) => {
  useEffect(() => {
    if (!tracks.length || !tracks.some(track => track.clips.length > 0)) return

    const loadVideoAndUpdateDuration = (videoSrc: string) => {
      return new Promise<number>((resolve, reject) => {
        const video = document.createElement('video')
        video.src = videoSrc

        video.onloadedmetadata = () => {
          const durationInSeconds = video.duration
          const actualDurationInFrames = Math.ceil(durationInSeconds * FPS)
          resolve(actualDurationInFrames)
        }

        video.onerror = () => {
          console.error('Error loading video for duration calculation')
          reject(new Error('Failed to load video'))
        }
      })
    }

    const updateAllVideoDurations = async () => {
      try {
        const firstVideoClip = tracks[0]?.clips[0]
        if (firstVideoClip?.type === 'video') {
          const actualDurationInFrames = await loadVideoAndUpdateDuration(firstVideoClip.src)

          setOriginalVideoDuration(actualDurationInFrames)
        }

        const updatedClips = new Map()

        // Process each track
        for (let clipIndex = 0; clipIndex < tracks.length; clipIndex++) {
          const track = tracks[clipIndex]

          // Process each clip in the track
          for (let ClipIndex = 0; ClipIndex < track.clips.length; ClipIndex++) {
            const clip = track.clips[ClipIndex]

            if (clip.type === 'video' && clip.durationInFrames <= 1) {
              try {
                const actualDurationInFrames = await loadVideoAndUpdateDuration(clip.src)
                updatedClips.set(`${clipIndex}-${ClipIndex}`, {
                  clipIndex,
                  ClipIndex,
                  duration: actualDurationInFrames,
                  originalDuration: actualDurationInFrames
                })
              } catch (error) {
                console.error(`Error updating duration for clip ${clipIndex}, clip ${ClipIndex}:`, error)
              }
            }
          }
        }

        if (updatedClips.size > 0) {
          setTracks(currentTracks => {
            const updatedTracks = JSON.parse(JSON.stringify(currentTracks))

            updatedClips.forEach(update => {
              const { clipIndex, ClipIndex, duration, originalDuration } = update
              if (updatedTracks[clipIndex]?.clips[ClipIndex]) {
                updatedTracks[clipIndex].clips[ClipIndex].durationInFrames = duration
                updatedTracks[clipIndex].clips[ClipIndex].originalDuration = originalDuration
              }
            })

            return updatedTracks
          })
        }
      } catch (error) {
        console.error('Error updating video durations:', error)
      }
    }

    updateAllVideoDurations()
  }, [tracks])
}
