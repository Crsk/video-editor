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
    if (!tracks.length || !tracks.some(track => track.items.length > 0)) return

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
        const firstVideoItem = tracks[0]?.items[0]
        if (firstVideoItem?.type === 'video') {
          const actualDurationInFrames = await loadVideoAndUpdateDuration(firstVideoItem.src)

          setOriginalVideoDuration(actualDurationInFrames)
        }

        const updatedItems = new Map()

        // Process each track
        for (let clipIndex = 0; clipIndex < tracks.length; clipIndex++) {
          const track = tracks[clipIndex]

          // Process each item in the track
          for (let itemIndex = 0; itemIndex < track.items.length; itemIndex++) {
            const item = track.items[itemIndex]

            if (item.type === 'video' && item.durationInFrames <= 1) {
              try {
                const actualDurationInFrames = await loadVideoAndUpdateDuration(item.src)
                updatedItems.set(`${clipIndex}-${itemIndex}`, {
                  clipIndex,
                  itemIndex,
                  duration: actualDurationInFrames,
                  originalDuration: actualDurationInFrames
                })
              } catch (error) {
                console.error(`Error updating duration for clip ${clipIndex}, item ${itemIndex}:`, error)
              }
            }
          }
        }

        if (updatedItems.size > 0) {
          setTracks(currentTracks => {
            const updatedTracks = JSON.parse(JSON.stringify(currentTracks))

            updatedItems.forEach(update => {
              const { clipIndex, itemIndex, duration, originalDuration } = update
              if (updatedTracks[clipIndex]?.items[itemIndex]) {
                updatedTracks[clipIndex].items[itemIndex].durationInFrames = duration
                updatedTracks[clipIndex].items[itemIndex].originalDuration = originalDuration
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
