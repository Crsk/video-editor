import { useCallback, useState } from 'react'
import { useEditor } from '../context/video-editor-provider'
import { Item, Track } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { applyGravityToTrack } from '../context/gravity'
import { calculateMediaDuration } from '../utils/media-utils'

/**
 * Hook providing methods to manage tracks and clips in the video editor
 */
export function useTrackManager() {
  const { tracks, setTracks } = useEditor()
  const [pendingOperations, setPendingOperations] = useState<Map<string, Promise<void>>>(new Map())

  /**
   * Create a new track with the given name
   * @param name The name of the track
   * @param volume Optional volume for the track (default: 1)
   * @returns The index of the newly created track
   */
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

  /**
   * Remove a track at the specified index
   * @param trackIndex The index of the track to remove
   */
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

  /**
   * Add a video clip to a track
   * @param trackIndex The index of the track to add the clip to
   * @param src Source URL for the video
   * @returns The ID of the newly created clip
   */
  const addVideoClip = useCallback(
    (trackIndex: number, src: string): string => {
      const clipId = uuidv4()

      // Create a promise for this operation
      const operationPromise = calculateMediaDuration(src, 'video').then(durationInFrames => {
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

        // Remove this operation from pending operations
        setPendingOperations(prev => {
          const newMap = new Map(prev)
          newMap.delete(clipId)
          return newMap
        })
      })

      // Store the promise
      setPendingOperations(prev => {
        const newMap = new Map(prev)
        newMap.set(clipId, operationPromise)
        return newMap
      })

      return clipId
    },
    [setTracks, calculateClipStartPosition]
  )

  /**
   * Add an audio clip to a track
   * @param trackIndex The index of the track to add the clip to
   * @param src Source URL for the audio
   * @returns The ID of the newly created clip
   */
  const addAudioClip = useCallback(
    (trackIndex: number, src: string): string => {
      const clipId = uuidv4()

      const operationPromise = calculateMediaDuration(src, 'audio').then(durationInFrames => {
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

        setPendingOperations(prev => {
          const newMap = new Map(prev)
          newMap.delete(clipId)
          return newMap
        })
      })

      setPendingOperations(prev => {
        const newMap = new Map(prev)
        newMap.set(clipId, operationPromise)
        return newMap
      })

      return clipId
    },
    [setTracks, calculateClipStartPosition]
  )

  /**
   * Remove a clip from a track
   * @param trackIndex The index of the track containing the clip
   * @param clipId The ID of the clip to remove
   */
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

  /**
   * Update a clip's properties
   * @param trackIndex The index of the track containing the clip
   * @param clipId The ID of the clip to update
   * @param updates Partial updates to apply to the clip
   */
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
    (trackIndex: number, src: string, type: 'video' | 'audio'): string => {
      const clipId = uuidv4()

      const operationPromise = calculateMediaDuration(src, type).then(durationInFrames => {
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

        setPendingOperations(prev => {
          const newMap = new Map(prev)
          newMap.delete(clipId)
          return newMap
        })
      })

      setPendingOperations(prev => {
        const newMap = new Map(prev)
        newMap.set(clipId, operationPromise)
        return newMap
      })

      return clipId
    },
    [setTracks]
  )

  const addClipToEnd = useCallback(
    (trackIndex: number, src: string, type: 'video' | 'audio'): string => {
      const clipId = uuidv4()

      const operationPromise = calculateMediaDuration(src, type).then(durationInFrames => {
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

        setPendingOperations(prev => {
          const newMap = new Map(prev)
          newMap.delete(clipId)
          return newMap
        })
      })

      setPendingOperations(prev => {
        const newMap = new Map(prev)
        newMap.set(clipId, operationPromise)
        return newMap
      })

      return clipId
    },
    [setTracks, calculateClipStartPosition]
  )

  const hasPendingOperations = useCallback((): boolean => {
    return pendingOperations.size > 0
  }, [pendingOperations])

  return {
    tracks,
    createTrack,
    removeTrack,
    addVideoClip,
    addAudioClip,
    addClipToBeginning,
    addClipToEnd,
    removeClip,
    updateClip,
    hasPendingOperations
  }
}
