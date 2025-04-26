import { useEffect } from 'react'
import type { Track } from '../types'

const FPS = 30

/**
 * Hook for loading audio files and calculating their durations
 *
 * @param tracks - The current tracks state
 * @param setTracks - Function to update tracks state
 */
export const useAudioLoader = (_: Track[], setTracks: React.Dispatch<React.SetStateAction<Track[]>>) => {
  useEffect(() => {
    // Function to load audio and update duration
    const loadAudioAndUpdateDuration = (audioSrc: string) => {
      return new Promise<number>((resolve, reject) => {
        const audio = new Audio(audioSrc)

        audio.onloadedmetadata = () => {
          // Calculate frames based on audio duration and FPS
          const durationInSeconds = audio.duration
          const actualDurationInFrames = Math.ceil(durationInSeconds * FPS)
          resolve(actualDurationInFrames)
        }

        // Handle potential errors
        audio.onerror = () => {
          console.error('Error loading audio for duration calculation')
          reject(new Error('Failed to load audio'))
        }
      })
    }

    // Process all tracks and update audio durations
    const updateAllAudioDurations = async () => {
      try {
        // Update all audio items across all tracks
        setTracks(prevTracks => {
          const newTracks = [...prevTracks]

          // Process each track
          for (let trackIndex = 0; trackIndex < newTracks.length; trackIndex++) {
            const track = newTracks[trackIndex]

            // Process each item in the track
            for (let itemIndex = 0; itemIndex < track.items.length; itemIndex++) {
              const item = track.items[itemIndex]

              // If it's an audio item, update its duration
              if (item.type === 'audio') {
                // Use a self-invoking async function to handle the async operation
                ;(async () => {
                  try {
                    const actualDurationInFrames = await loadAudioAndUpdateDuration(item.src)

                    // Update the track item with the actual duration
                    setTracks(currentTracks => {
                      const updatedTracks = [...currentTracks]
                      if (updatedTracks[trackIndex]?.items[itemIndex]) {
                        updatedTracks[trackIndex].items[itemIndex] = {
                          ...updatedTracks[trackIndex].items[itemIndex],
                          durationInFrames: actualDurationInFrames
                        }
                      }
                      return updatedTracks
                    })
                  } catch (error) {
                    console.error(`Error updating duration for track ${trackIndex}, item ${itemIndex}:`, error)
                  }
                })()
              }
            }
          }

          return newTracks
        })
      } catch (error) {
        console.error('Error updating audio durations:', error)
      }
    }

    updateAllAudioDurations()
  }, [])
}
