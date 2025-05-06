import { Dispatch, SetStateAction, useEffect } from 'react'
import type { Track, MediaType } from '../types'

const FPS = 30

export const useMediaLoader = (
  tracks: Track[],
  setTracks: Dispatch<SetStateAction<Track[]>>,
  setOriginalDurations: {
    video: Dispatch<SetStateAction<number | null>>
    audio: Dispatch<SetStateAction<number | null>>
  }
) => {
  useEffect(() => {
    if (!tracks.length || !tracks.some(track => track.clips.length > 0)) return

    const loadMediaAndUpdateDuration = (mediaType: MediaType, mediaSrc: string) => {
      return new Promise<number>((resolve, reject) => {
        if (mediaType === 'video') {
          const video = document.createElement('video')
          video.src = mediaSrc

          video.onloadedmetadata = () => {
            const durationInSeconds = video.duration
            const actualDurationInFrames = Math.ceil(durationInSeconds * FPS)
            resolve(actualDurationInFrames)
          }

          video.onerror = () => {
            console.error('Error loading video for duration calculation')
            reject(new Error('Failed to load video'))
          }
        } else if (mediaType === 'audio') {
          const audio = new Audio(mediaSrc)

          audio.onloadedmetadata = () => {
            const durationInSeconds = audio.duration
            const actualDurationInFrames = Math.ceil(durationInSeconds * FPS)
            resolve(actualDurationInFrames)
          }

          audio.onerror = () => {
            console.error('Error loading audio for duration calculation')
            reject(new Error('Failed to load audio'))
          }
        } else {
          reject(new Error(`Unsupported media type: ${mediaType}`))
        }
      })
    }

    const updateAllMediaDurations = async () => {
      try {
        // Check for first video clip to set original video duration
        const firstVideoTrack = tracks.find(track => track.clips.some(clip => clip.type === 'video'))
        const firstVideoClip = firstVideoTrack?.clips.find(clip => clip.type === 'video')

        if (firstVideoClip) {
          const actualDurationInFrames = await loadMediaAndUpdateDuration('video', firstVideoClip.src)
          setOriginalDurations.video(actualDurationInFrames)
        }

        // Check for first audio clip to set original audio duration
        const firstAudioTrack = tracks.find(track => track.clips.some(clip => clip.type === 'audio'))
        const firstAudioClip = firstAudioTrack?.clips.find(clip => clip.type === 'audio')

        if (firstAudioClip) {
          const actualDurationInFrames = await loadMediaAndUpdateDuration('audio', firstAudioClip.src)
          setOriginalDurations.audio(actualDurationInFrames)
        }

        const updatedClips = new Map()

        // Process each track
        for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
          const track = tracks[trackIndex]

          // Process each clip in the track
          for (let clipIndex = 0; clipIndex < track.clips.length; clipIndex++) {
            const clip = track.clips[clipIndex]

            // Only update clips with unset durations (durationInFrames <= 1)
            if ((clip.type === 'video' || clip.type === 'audio') && clip.durationInFrames <= 1) {
              try {
                const actualDurationInFrames = await loadMediaAndUpdateDuration(clip.type, clip.src)
                updatedClips.set(`${trackIndex}-${clipIndex}`, {
                  trackIndex,
                  clipIndex,
                  duration: actualDurationInFrames,
                  originalDuration: actualDurationInFrames
                })
              } catch (error) {
                console.error(`Error updating duration for track ${trackIndex}, clip ${clipIndex}:`, error)
              }
            }
          }
        }

        if (updatedClips.size > 0) {
          setTracks(currentTracks => {
            const updatedTracks = JSON.parse(JSON.stringify(currentTracks))

            updatedClips.forEach(update => {
              const { trackIndex, clipIndex, duration, originalDuration } = update
              if (updatedTracks[trackIndex]?.clips[clipIndex]) {
                updatedTracks[trackIndex].clips[clipIndex].durationInFrames = duration
                updatedTracks[trackIndex].clips[clipIndex].originalDuration = originalDuration
              }
            })

            return updatedTracks
          })
        }
      } catch (error) {
        console.error('Error updating media durations:', error)
      }
    }

    updateAllMediaDurations()
  }, [tracks, setTracks, setOriginalDurations])
}
