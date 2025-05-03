import { useCallback } from 'react'
import { useEditor } from '../context/video-editor-provider'
import { Item, Track } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { applyGravityToTrack } from '../context/gravity'

export function useTrackManager() {
  const { tracks, setTracks, handleVideoRenderOptionChange, handleVideoPositionChange } = useEditor()

  const createTrack = useCallback(
    (name: string, volume = 1): number => {
      let newTrackIndex = 0

      setTracks(prevTracks => {
        const newTrack: Track = {
          name,
          items: [],
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

  const removeTrack = useCallback(
    (trackIndex: number): void => {
      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        updatedTracks.splice(trackIndex, 1)
        return updatedTracks
      })
    },
    [setTracks]
  )

  const calculateClipStartPosition = useCallback((items: Item[]): number => {
    if (items.length === 0) return 0

    let maxEndPosition = 0
    items.forEach(item => {
      const endPosition = item.from + item.durationInFrames
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
        const newClip: Item = {
          id: clipId,
          type: 'video',
          from: calculateClipStartPosition(track.items),
          durationInFrames,
          src,
          volume: 1
        }

        // Add the clip and apply gravity to ensure no gaps
        const updatedItems = applyGravityToTrack([...track.items, newClip])

        updatedTracks[trackIndex] = {
          ...track,
          items: updatedItems
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
        const newClip: Item = {
          id: clipId,
          type: 'audio',
          from: calculateClipStartPosition(track.items),
          durationInFrames,
          src,
          volume: 1
        }

        const updatedItems = applyGravityToTrack([...track.items, newClip])

        updatedTracks[trackIndex] = {
          ...track,
          items: updatedItems
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
          items: track.items.filter(item => item.id !== clipId)
        }

        return updatedTracks
      })
    },
    [setTracks]
  )

  const updateClip = useCallback(
    (trackIndex: number, clipId: string, updates: Partial<Omit<Item, 'id' | 'type'>>): void => {
      setTracks(prevTracks => {
        if (trackIndex < 0 || trackIndex >= prevTracks.length) {
          console.warn(`Track index ${trackIndex} is out of bounds`)
          return prevTracks
        }

        const updatedTracks = [...prevTracks]
        const track = updatedTracks[trackIndex]

        updatedTracks[trackIndex] = {
          ...track,
          items: track.items.map(item => {
            if (item.id === clipId) {
              return { ...item, ...updates }
            }
            return item
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

        const newClip: Item = {
          id: clipId,
          type,
          from: 0,
          durationInFrames,
          src,
          volume: 1
        }

        const updatedItems = applyGravityToTrack([newClip, ...track.items])

        updatedTracks[trackIndex] = {
          ...track,
          items: updatedItems
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
        const endPosition = calculateClipStartPosition(track.items)

        const newClip: Item = {
          id: clipId,
          type,
          from: endPosition,
          durationInFrames,
          src,
          volume: 1
        }

        updatedTracks[trackIndex] = {
          ...track,
          items: [...track.items, newClip]
        }

        return updatedTracks
      })

      return clipId
    },
    [setTracks, calculateClipStartPosition]
  )

  const setVideoRenderOption = useCallback(
    (itemId: string, renderOption: 'default' | 'contain-blur' | 'cover'): void => {
      handleVideoRenderOptionChange(itemId, renderOption)
    },
    [handleVideoRenderOptionChange]
  )

  const setVideoPosition = useCallback(
    (itemId: string, positionX: number, positionY: number): void => {
      handleVideoPositionChange(itemId, positionX, positionY)
    },
    [handleVideoPositionChange]
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

  return {
    // Track management
    tracks,
    getAllTracks,
    createTrack,
    removeTrack,
    selectTrack,
    renameTrack,

    // Clip management
    addVideoClip,
    addAudioClip,
    addClipToBeginning,
    addClipToEnd,
    removeClip,
    updateClip,

    // Video controls
    setVideoRenderOption,
    setVideoPosition
  }
}
