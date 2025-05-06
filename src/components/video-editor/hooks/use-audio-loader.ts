import { useEffect } from 'react'
import type { Track } from '../types'

const FPS = 30

/**
 * Hook for loading audio files and calculating their durations
 *
 * @param tracks - The current tracks state
 * @param setTracks - Function to update tracks state
 * @param setOriginalAudioDuration - Function to set the original audio duration
 */
export const useAudioLoader = (
  tracks: Track[],
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>,
  setOriginalAudioDuration: React.Dispatch<React.SetStateAction<number | null>>
) => {
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

    const updateAllAudioDurations = async () => {
      try {
        const firstAudioClip = tracks[0]?.clips[0]
        if (firstAudioClip?.type === 'audio') {
          const actualDurationInFrames = await loadAudioAndUpdateDuration(firstAudioClip.src)

          setOriginalAudioDuration(actualDurationInFrames)
        }

        const updatedClips = new Map()

        // Process each track
        for (let clipIndex = 0; clipIndex < tracks.length; clipIndex++) {
          const track = tracks[clipIndex]

          // Process each clip in the track
          for (let ClipIndex = 0; ClipIndex < track.clips.length; ClipIndex++) {
            const clip = track.clips[ClipIndex]

            if (clip.type === 'audio' && clip.durationInFrames <= 1) {
              try {
                const actualDurationInFrames = await loadAudioAndUpdateDuration(clip.src)
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
        console.error('Error updating audio durations:', error)
      }
    }

    updateAllAudioDurations()
  }, [tracks])
}
