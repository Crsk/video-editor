import { useCallback } from 'react'
import { useEditor } from '../context/video-editor-provider'
import { Clip, MediaType, Track, VideoClip, CaptionClip } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { applyGravityToTrack } from '../context/gravity'

const FPS = 30

export function useTrackManager() {
  const {
    tracks,
    setTracks,
    handleVideoRenderOptionChange,
    handleVideoPositionChange,
    handleVideoZoomChange,
    handleSplitClip,
    currentTime
  } = useEditor()

  const createTrack = useCallback(
    (name: string, volume = 1): number => {
      let newTrackIndex = 0

      setTracks(prevTracks => {
        const newTrack: Track = {
          name,
          clips: [],
          volume
        }
        const updatedTracks = [...prevTracks, newTrack]
        newTrackIndex = updatedTracks.length - 1
        return updatedTracks
      })

      return newTrackIndex
    },
    [setTracks]
  )

  const hasCaptionTracks = useCallback((): boolean => {
    return tracks.some(track => track.type === 'caption')
  }, [tracks])

  const autoUpdateCaptionsIfExist = useCallback((): void => {
    if (!hasCaptionTracks()) return

    const allWords: { word: string; start: number; end: number }[] = []

    tracks.forEach(track => {
      track.clips.forEach(clip => {
        if (clip.type === 'video' && (clip as VideoClip).words) {
          const videoClip = clip as VideoClip
          const clipStartInSeconds = videoClip.from / 30
          const clipOffset = (videoClip.offset || 0) / 30

          videoClip.words?.forEach(word => {
            allWords.push({
              word: word.word,
              start: clipStartInSeconds + (word.start - clipOffset),
              end: clipStartInSeconds + (word.end - clipOffset)
            })
          })
        }
      })
    })

    allWords.sort((a, b) => a.start - b.start)

    if (allWords.length > 0) {
      setTracks(prevTracks => {
        // Remove all existing caption tracks
        const tracksWithoutCaptions = prevTracks.filter(track => track.type !== 'caption')

        const captionClips: CaptionClip[] = allWords.map(word => ({
          id: uuidv4(),
          type: 'caption',
          from: Math.round(word.start * 30),
          durationInFrames: Math.round((word.end - word.start) * 30),
          text: word.word,
          color: '#ffffff',
          fontSize: 56,
          fontWeight: 900,
          textAlign: 'center',
          positionY: 80
        }))

        const newCaptionTrack: Track = {
          name: 'Captions',
          clips: captionClips,
          volume: 1,
          type: 'caption'
        }

        return [...tracksWithoutCaptions, newCaptionTrack]
      })
    }
  }, [tracks, hasCaptionTracks, setTracks])

  const removeTrack = useCallback(
    (trackIndex: number): void => {
      let removedTrackHadVideoClips = false

      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const trackToRemove = prevTracks[trackIndex]
        removedTrackHadVideoClips = trackToRemove.clips.some(clip => clip.type === 'video' && (clip as VideoClip).words)

        const updatedTracks = [...prevTracks]
        updatedTracks.splice(trackIndex, 1)
        return updatedTracks
      })

      if (removedTrackHadVideoClips) setTimeout(autoUpdateCaptionsIfExist, 100)
    },
    [setTracks, autoUpdateCaptionsIfExist]
  )

  const calculateClipStartPosition = useCallback((clips: Clip[]): number => {
    if (clips.length === 0) return 0

    let maxEndPosition = 0
    clips.forEach(clip => {
      const endPosition = clip.from + clip.durationInFrames
      if (endPosition > maxEndPosition) {
        maxEndPosition = endPosition
      }
    })

    return maxEndPosition
  }, [])

  const addVideoClip = useCallback(
    (trackIndex: number, src: string, durationInFrames: number = 30): string => {
      const clipId = uuidv4()

      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]

        // Create the new clip and add it to the track
        const newClip: Clip = {
          id: clipId,
          type: 'video',
          from: calculateClipStartPosition(track.clips),
          durationInFrames,
          src,
          volume: 1
        }

        // Add the clip and apply gravity to ensure no gaps
        const updatedClips = applyGravityToTrack([...track.clips, newClip])

        updatedTracks[trackIndex] = {
          ...track,
          clips: updatedClips
        }

        return updatedTracks
      })

      return clipId
    },
    [setTracks, calculateClipStartPosition]
  )

  const addAudioClip = useCallback(
    (trackIndex: number, src: string, durationInFrames: number = 30): string => {
      const clipId = uuidv4()

      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]
        const newClip: Clip = {
          id: clipId,
          type: 'audio',
          from: calculateClipStartPosition(track.clips),
          durationInFrames,
          src,
          volume: 1
        }

        const updatedClips = applyGravityToTrack([...track.clips, newClip])

        updatedTracks[trackIndex] = {
          ...track,
          clips: updatedClips
        }

        return updatedTracks
      })

      return clipId
    },
    [setTracks, calculateClipStartPosition]
  )

  const removeClip = useCallback(
    (trackIndex: number, clipId: string): void => {
      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]

        updatedTracks[trackIndex] = {
          ...track,
          clips: track.clips.filter(clip => clip.id !== clipId)
        }

        return updatedTracks
      })

      setTimeout(() => autoUpdateCaptionsIfExist, 100)
    },
    [setTracks, autoUpdateCaptionsIfExist]
  )

  const updateClip = useCallback(
    (trackIndex: number, clipId: string, updates: Partial<Omit<Clip, 'id' | 'type'>>): void => {
      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]

        updatedTracks[trackIndex] = {
          ...track,
          clips: track.clips.map(clip => {
            if (clip.id === clipId) {
              return { ...clip, ...updates }
            }
            return clip
          })
        }

        return updatedTracks
      })
    },
    [setTracks]
  )

  const addClipToBeginning = useCallback(
    (trackIndex: number, src: string, type: 'video' | 'audio', durationInFrames: number = 30): string => {
      const clipId = uuidv4()

      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]

        const newClip: Clip = {
          id: clipId,
          type,
          from: 0,
          durationInFrames,
          src,
          volume: 1
        }

        const updatedClips = applyGravityToTrack([newClip, ...track.clips])

        updatedTracks[trackIndex] = {
          ...track,
          clips: updatedClips
        }

        return updatedTracks
      })

      return clipId
    },
    [setTracks]
  )

  const addClipToEnd = useCallback(
    (trackIndex: number, src: string, type: 'video' | 'audio', durationInFrames: number = 30): string => {
      const clipId = uuidv4()

      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]
        const endPosition = calculateClipStartPosition(track.clips)

        const newClip: Clip = {
          id: clipId,
          type,
          from: endPosition,
          durationInFrames,
          src,
          volume: 1
        }

        updatedTracks[trackIndex] = {
          ...track,
          clips: [...track.clips, newClip]
        }

        return updatedTracks
      })

      return clipId
    },
    [setTracks, calculateClipStartPosition]
  )

  const setVideoRenderOption = useCallback(
    (ClipId: string, renderOption: 'default' | 'contain-blur' | 'cover'): void => {
      handleVideoRenderOptionChange(ClipId, renderOption)
    },
    [handleVideoRenderOptionChange]
  )

  const setVideoPosition = useCallback(
    (ClipId: string, positionX: number, positionY: number): void => {
      handleVideoPositionChange(ClipId, positionX, positionY)
    },
    [handleVideoPositionChange]
  )

  const setVideoZoom = useCallback(
    (ClipId: string, zoom: number): void => {
      handleVideoZoomChange(ClipId, zoom)
    },
    [handleVideoZoomChange]
  )

  const getAllTracks = useCallback((): Track[] => {
    return tracks
  }, [tracks])

  const selectTrack = useCallback(
    (index: number): Track | undefined => {
      if (index < 0 || index >= tracks.length) {
        console.warn(`Track index ${index} is out of bounds`)
        return undefined
      }
      return tracks[index]
    },
    [tracks]
  )

  const renameTrack = useCallback(
    (trackIndex: number, newName: string): void => {
      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        updatedTracks[trackIndex] = {
          ...updatedTracks[trackIndex],
          name: newName
        }

        return updatedTracks
      })
    },
    [setTracks]
  )

  const splitClip = useCallback(
    (trackIndex: number, clipId: string): void => {
      const track = tracks[trackIndex]
      if (!track) return

      const clipIndex = track.clips.findIndex(clip => clip.id === clipId)
      if (clipIndex === -1) return

      const currentTimeInFrames = Math.round(currentTime * FPS)

      handleSplitClip(trackIndex, clipIndex, currentTimeInFrames)
    },
    [tracks, currentTime, handleSplitClip]
  )

  const getTrackType = useCallback(
    (trackIndex: number): MediaType | 'generic' | 'caption' => {
      const track = tracks[trackIndex]
      if (!track) return 'generic'

      if (track.type === 'caption' || track.clips.some((clip: Clip) => clip.type === 'caption')) return 'caption'
      if (track.type === 'video' || track.type === 'audio') return track.type
      if (track.clips.some((clip: Clip) => clip.type === 'video')) return 'video'
      if (track.clips.some((clip: Clip) => clip.type === 'audio')) return 'audio'

      return 'generic'
    },
    [tracks]
  )

  const findClipsBySrc = useCallback(
    ({ src }: { src: string }): { trackIndex: number; clip: Clip }[] => {
      const results: { trackIndex: number; clip: Clip }[] = []

      tracks.forEach((track, trackIndex) => {
        track.clips.forEach(clip => {
          if ('src' in clip && clip.src === src) results.push({ trackIndex, clip })
        })
      })

      return results
    },
    [tracks]
  )

  const loadTranscriptForSrc = useCallback(
    ({ src, words }: { src: string; words: { word: string; start: number; end: number }[] }): void => {
      if (!src || !words || !Array.isArray(words) || words.length === 0) return

      const matchingClips = findClipsBySrc({ src })

      if (matchingClips.length === 0) {
        console.warn(`No clips found with src: ${src}`)
        return
      }

      const needsUpdate = matchingClips.some(
        ({ clip }) =>
          clip.type === 'video' &&
          (!('words' in clip) || JSON.stringify((clip as VideoClip).words) !== JSON.stringify(words))
      )

      if (!needsUpdate) return

      setTracks(prevTracks => {
        const updatedTracks = [...prevTracks]

        matchingClips.forEach(({ trackIndex, clip }) => {
          if (clip.type !== 'video') return

          const trackClips = [...updatedTracks[trackIndex].clips]
          const clipIndex = trackClips.findIndex(c => c.id === clip.id)

          if (clipIndex !== -1) {
            trackClips[clipIndex] = { ...trackClips[clipIndex], words } as VideoClip
            updatedTracks[trackIndex] = { ...updatedTracks[trackIndex], clips: trackClips }
          }
        })

        return updatedTracks
      })
    },
    [findClipsBySrc, setTracks]
  )

  const addCaptionClip = useCallback(
    (
      trackIndex: number,
      text: string,
      from: number,
      durationInFrames: number,
      options?: Partial<Pick<CaptionClip, 'color' | 'fontSize' | 'fontWeight' | 'textAlign' | 'positionY'>>
    ): string => {
      const clipId = uuidv4()

      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]
        const newClip: CaptionClip = {
          id: clipId,
          type: 'caption',
          from,
          durationInFrames,
          text,
          color: options?.color || '#ffffff',
          fontSize: options?.fontSize || 56,
          fontWeight: options?.fontWeight || 900,
          textAlign: options?.textAlign || 'center',
          positionY: options?.positionY || 80
        }

        const updatedClips = [...track.clips, newClip]

        updatedTracks[trackIndex] = {
          ...track,
          clips: updatedClips,
          type: 'caption'
        }

        return updatedTracks
      })

      return clipId
    },
    [setTracks]
  )

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

  const createCaptionsFromWords = useCallback(
    (trackIndex: number, words: { word: string; start: number; end: number }[], fps: number = 30): void => {
      if (!words || words.length === 0) return

      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]

        // Create individual caption clips for each word
        const captionClips: CaptionClip[] = words.map(word => ({
          id: uuidv4(),
          type: 'caption',
          from: Math.round(word.start * fps),
          durationInFrames: Math.round((word.end - word.start) * fps),
          text: word.word,
          color: '#ffffff',
          fontSize: 56,
          fontWeight: 900,
          textAlign: 'center',
          positionY: 80
        }))

        updatedTracks[trackIndex] = {
          ...track,
          clips: captionClips,
          type: 'caption'
        }

        return updatedTracks
      })
    },
    [setTracks]
  )

  const replaceAllCaptionTracks = useCallback(
    (words: { word: string; start: number; end: number }[], fps: number = 30): void => {
      if (!words || words.length === 0) return

      setTracks(prevTracks => {
        // Remove all existing caption tracks
        const tracksWithoutCaptions = prevTracks.filter(track => track.type !== 'caption')

        // Create individual caption clips for each word
        const captionClips: CaptionClip[] = words.map(word => ({
          id: uuidv4(),
          type: 'caption',
          from: Math.round(word.start * fps),
          durationInFrames: Math.round((word.end - word.start) * fps),
          text: word.word,
          color: '#ffffff',
          fontSize: 56,
          fontWeight: 900,
          textAlign: 'center',
          positionY: 80
        }))

        // Create new caption track at the end
        const newCaptionTrack: Track = {
          name: 'Captions',
          clips: captionClips,
          volume: 1,
          type: 'caption'
        }

        return [...tracksWithoutCaptions, newCaptionTrack]
      })
    },
    [setTracks]
  )

  return {
    // Track management
    tracks,
    getAllTracks,
    createTrack,
    createCaptionTrack,
    removeTrack,
    selectTrack,
    renameTrack,
    getTrackType,

    // Clip management
    addVideoClip,
    addAudioClip,
    addCaptionClip,
    addClipToBeginning,
    addClipToEnd,
    removeClip,
    updateClip,
    splitClip,
    calculateClipStartPosition,
    findClipsBySrc,
    loadTranscriptForSrc,
    createCaptionsFromWords,
    replaceAllCaptionTracks,
    hasCaptionTracks,
    autoUpdateCaptionsIfExist,

    // Video controls
    setVideoRenderOption,
    setVideoPosition,
    setVideoZoom
  }
}
