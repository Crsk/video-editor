import { useCallback } from 'react'
import { useEditor } from '../../context/video-editor-provider'
import { Track, CaptionClip, VideoClip } from '../../types'
import { WordTimestamp } from '../../types/caption.types'
import { useCaptionManager } from './use-caption-manager'

export const useCaptionTrackManager = () => {
  const { tracks, setTracks } = useEditor()
  const { createCaptionClipsFromWords, calculateWordTiming } = useCaptionManager()

  const hasCaptionTracks = useCallback((): boolean => {
    return tracks.some(track => track.type === 'caption')
  }, [tracks])

  const getCaptionTracks = useCallback((): Track[] => {
    return tracks.filter(track => track.type === 'caption')
  }, [tracks])

  const createCaptionTrack = useCallback(
    (name: string = 'Captions'): number => {
      let newTrackIndex = 0

      setTracks(prevTracks => {
        const newTrack: Track = {
          name,
          clips: [],
          volume: 1,
          type: 'caption'
        }
        const updatedTracks = [...prevTracks, newTrack]
        newTrackIndex = updatedTracks.length - 1
        return updatedTracks
      })

      return newTrackIndex
    },
    [setTracks]
  )

  const addCaptionClip = useCallback(
    (trackIndex: number, captionClip: CaptionClip): void => {
      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]

        updatedTracks[trackIndex] = {
          ...track,
          clips: [...track.clips, captionClip],
          type: 'caption'
        }

        return updatedTracks
      })
    },
    [setTracks]
  )

  const createCaptionsFromWords = useCallback(
    (trackIndex: number, words: WordTimestamp[]): void => {
      if (!words || words.length === 0) return

      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]
        const captionClips = createCaptionClipsFromWords(words)

        updatedTracks[trackIndex] = {
          ...track,
          clips: captionClips,
          type: 'caption'
        }

        return updatedTracks
      })
    },
    [setTracks, createCaptionClipsFromWords]
  )

  const replaceAllCaptionTracks = useCallback(
    (words: WordTimestamp[]): void => {
      if (!words || words.length === 0) return

      setTracks(prevTracks => {
        const tracksWithoutCaptions = prevTracks.filter(track => track.type !== 'caption')

        const captionClips = createCaptionClipsFromWords(words)
        const newCaptionTrack: Track = {
          name: 'Captions',
          clips: captionClips,
          volume: 1,
          type: 'caption'
        }

        return [...tracksWithoutCaptions, newCaptionTrack]
      })
    },
    [setTracks, createCaptionClipsFromWords]
  )

  const autoUpdateCaptionsFromVideoTracks = useCallback((): void => {
    const allWords: WordTimestamp[] = []

    tracks.forEach(track => {
      track.clips.forEach(clip => {
        if (clip.type === 'video' && (clip as VideoClip).words) {
          const videoClip = clip as VideoClip
          const clipStartInSeconds = videoClip.from / 30
          const clipOffset = (videoClip.offset || 0) / 30

          videoClip.words?.forEach(word => {
            const timing = calculateWordTiming(clipStartInSeconds, clipOffset, word.start, word.end)
            allWords.push({
              word: word.word,
              start: timing.start,
              end: timing.end
            })
          })
        }
      })
    })

    allWords.sort((a, b) => a.start - b.start)

    if (allWords.length > 0) {
      if (!hasCaptionTracks()) createCaptionTrack('Captions')

      replaceAllCaptionTracks(allWords)
    }
  }, [tracks, hasCaptionTracks, createCaptionTrack, calculateWordTiming, replaceAllCaptionTracks])

  const removeCaptionTracks = useCallback((): void => {
    setTracks(prevTracks => prevTracks.filter(track => track.type !== 'caption'))
  }, [setTracks])

  const updateCaptionTrackName = useCallback(
    (trackIndex: number, newName: string): void => {
      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const track = prevTracks[trackIndex]
        if (track.type !== 'caption') {
          console.warn(`Track at index ${trackIndex} is not a caption track`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        updatedTracks[trackIndex] = { ...track, name: newName }
        return updatedTracks
      })
    },
    [setTracks]
  )

  return {
    // Track queries
    hasCaptionTracks,
    getCaptionTracks,

    // Track management
    createCaptionTrack,
    removeCaptionTracks,
    updateCaptionTrackName,

    // Clip management
    addCaptionClip,
    createCaptionsFromWords,
    replaceAllCaptionTracks,

    // Auto-sync
    autoUpdateCaptionsFromVideoTracks
  }
}
