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
    // Function to load video and update duration
    const loadVideoAndUpdateDuration = (videoSrc: string) => {
      return new Promise<number>((resolve, reject) => {
        const video = document.createElement('video')
        video.src = videoSrc

        video.onloadedmetadata = () => {
          // Calculate frames based on video duration and FPS
          const durationInSeconds = video.duration
          const actualDurationInFrames = Math.ceil(durationInSeconds * FPS)
          resolve(actualDurationInFrames)
        }

        // Handle potential errors
        video.onerror = () => {
          console.error('Error loading video for duration calculation')
          reject(new Error('Failed to load video'))
        }
      })
    }

    // Process all tracks and update video durations
    const updateAllVideoDurations = async () => {
      try {
        // Get the first video to set as the original duration reference
        const firstVideoItem = tracks[0]?.items[0]
        if (firstVideoItem?.type === 'video') {
          const actualDurationInFrames = await loadVideoAndUpdateDuration(firstVideoItem.src)
          // Store the original video duration in frames
          setOriginalVideoDuration(actualDurationInFrames)
        }

        // Update all video items across all tracks
        setTracks(prevTracks => {
          const newTracks = [...prevTracks]

          // Process each track
          for (let clipIndex = 0; clipIndex < newTracks.length; clipIndex++) {
            const track = newTracks[clipIndex]

            // Process each item in the track
            for (let itemIndex = 0; itemIndex < track.items.length; itemIndex++) {
              const item = track.items[itemIndex]

              // If it's a video item, update its duration
              if (item.type === 'video') {
                // Use a self-invoking async function to handle the async operation
                ;(async () => {
                  try {
                    const actualDurationInFrames = await loadVideoAndUpdateDuration(item.src)

                    // Update the clip with the actual duration
                    setTracks(currentTracks => {
                      const updatedTracks = [...currentTracks]
                      if (updatedTracks[clipIndex]?.items[itemIndex]) {
                        updatedTracks[clipIndex].items[itemIndex] = {
                          ...updatedTracks[clipIndex].items[itemIndex],
                          durationInFrames: actualDurationInFrames
                        }
                      }
                      return updatedTracks
                    })
                  } catch (error) {
                    console.error(`Error updating duration for clip ${clipIndex}, item ${itemIndex}:`, error)
                  }
                })()
              }
            }
          }

          return newTracks
        })
      } catch (error) {
        console.error('Error updating video durations:', error)
      }
    }

    updateAllVideoDurations()
  }, [])
}
