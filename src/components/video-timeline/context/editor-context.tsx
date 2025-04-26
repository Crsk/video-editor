import { createContext, useContext, useState, useRef, useEffect, ReactNode, FC, RefObject } from 'react'
import { PlayerRef } from '@remotion/player'
import { Track, Item } from '../types'
import { useVideoLoader } from '../hooks/use-video-loader'
import { useAudioLoader } from '../hooks/use-audio-loader'
import { applyGravityToTrack } from './gravity'

interface EditorContextState {
  // Track data
  tracks: Track[]
  setTracks: (tracks: Track[] | ((prev: Track[]) => Track[])) => void

  // Player state
  playerRef: RefObject<PlayerRef | null>
  isPlaying: boolean
  currentTime: number
  isLooping: boolean
  setIsLooping: (isLooping: boolean) => void
  originalVideoDuration: number | null

  // Timeline state
  durationInFrames: number

  // Player controls
  togglePlayPause: () => void
  handleTimeUpdate: (newTimeInSeconds: number) => void
  toggleLoop: () => void
  handleTrackUpdate: (trackIndex: number, updatedItems: Item[]) => void
  handleTrackVolumeChange: (trackIndex: number, volume: number) => void
  handleAudioItemVolumeChange: (itemId: string, volume: number) => void

  // Move item between tracks with collision detection
  moveItemToTrack: (
    sourceTrackIndex: number,
    itemIndex: number,
    targetTrackIndex: number,
    newStartFrame: number
  ) => boolean // returns true if move succeeded, false if collision
}

// Create the context with a default undefined value
const EditorContext = createContext<EditorContextState | undefined>(undefined)

interface EditorProviderProps {
  children: ReactNode
  initialTracks?: Track[]
}

const FPS = 30

export const EditorProvider: FC<EditorProviderProps> = ({
  children,
  initialTracks = [
    {
      name: 'Track 1',
      items: [
        {
          id: 'item-1',
          from: 0,
          durationInFrames: 1,
          type: 'video',
          src: '/manson_clone.mp4'
        }
      ],
      volume: 1
    },
    {
      name: 'Track 2',
      items: [
        {
          id: 'item-2',
          from: 0,
          durationInFrames: 1,
          type: 'video',
          src: '/manson_clone.mp4'
        }
      ],
      volume: 1
    },
    {
      name: 'Audio Track',
      items: [
        {
          id: 'audio-1',
          from: 0,
          durationInFrames: 1, // This will be updated by the audio loader
          type: 'audio',
          src: '/spectre.mp3'
        }
      ],
      volume: 1
    }
  ]
}) => {
  // State for tracks
  const [tracks, setTracks] = useState<Track[]>(initialTracks)

  // Player state
  const playerRef = useRef<PlayerRef | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLooping, setIsLooping] = useState(true)
  const [originalVideoDuration, setOriginalVideoDuration] = useState<number | null>(null)

  // Use the video loader hook to handle video loading and duration calculation
  useVideoLoader(tracks, setTracks, setOriginalVideoDuration)

  // Use the audio loader hook to handle audio loading and duration calculation
  useAudioLoader(tracks, setTracks)

  // Handle video playback with direct player control
  const togglePlayPause = () => {
    const player = playerRef.current
    if (!player) return

    try {
      const currentlyPlaying = player.isPlaying()
      currentlyPlaying ? player.pause() : player.play()

      setTimeout(() => {
        const newState = player.isPlaying()
        setIsPlaying(newState)
      }, 50)
    } catch (error) {
      console.error('Error toggling play/pause:', error)
    }
  }

  // Handle time update from timeline marker drag
  const handleTimeUpdate = (newTimeInSeconds: number) => {
    if (playerRef.current) {
      // If video is playing, pause it during scrubbing
      if (isPlaying) {
        playerRef.current.pause()
        setIsPlaying(false)
      }

      // Convert seconds to frames and seek to that position
      const framePosition = Math.round(newTimeInSeconds * FPS)
      playerRef.current.seekTo(framePosition)

      // Update the current time state
      setCurrentTime(newTimeInSeconds)
    }
  }

  // Toggle loop mode
  const toggleLoop = () => {
    setIsLooping(prev => !prev)
  }

  // Handle track updates (for resizing video items)
  const handleTrackUpdate = (trackIndex: number, updatedItems: Item[]) => {
    setTracks(prevTracks => {
      const newTracks = [...prevTracks]
      newTracks[trackIndex] = {
        ...newTracks[trackIndex],
        items: applyGravityToTrack(updatedItems)
      }
      return newTracks
    })
  }

  // Add global keyboard shortcut for space key to play/pause
  useEffect(() => {
    let isProcessingKeyPress = false

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the key pressed is space and not inside an input field
      if (
        e.code === 'Space' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) &&
        !isProcessingKeyPress
      ) {
        e.preventDefault()

        // Set flag to prevent multiple rapid keypresses
        isProcessingKeyPress = true

        togglePlayPause()

        setTimeout(() => {
          isProcessingKeyPress = false
        }, 100)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Set up player event listeners for frame updates
  useEffect(() => {
    const setupListeners = () => {
      const player = playerRef.current
      if (!player) return null

      setIsPlaying(player.isPlaying())
      setCurrentTime(player.getCurrentFrame() / FPS)

      const handleFrameUpdate = () => {
        const frame = player.getCurrentFrame()
        setCurrentTime(frame / FPS) // Convert frames to seconds based on FPS
      }

      const handlePlaybackChange = () => {
        setIsPlaying(player.isPlaying())
      }

      player.addEventListener('timeupdate', handleFrameUpdate) // Main event for time updates
      player.addEventListener('frameupdate', handleFrameUpdate) // Additional event for frame-by-frame updates
      player.addEventListener('play', handlePlaybackChange)
      player.addEventListener('pause', handlePlaybackChange)

      // Set up a high-frequency update interval as a fallback
      const updateInterval = setInterval(() => {
        if (player.isPlaying()) {
          handleFrameUpdate()
        }
      }, 16.67) // ~60fps updates

      return () => {
        player.removeEventListener('timeupdate', handleFrameUpdate)
        player.removeEventListener('frameupdate', handleFrameUpdate)
        player.removeEventListener('play', handlePlaybackChange)
        player.removeEventListener('pause', handlePlaybackChange)
        clearInterval(updateInterval)
      }
    }
    const cleanup = setupListeners()

    const interval = setInterval(() => {
      if (playerRef.current && !cleanup) {
        clearInterval(interval)
        setupListeners()
      }
    }, 100)

    return () => {
      clearInterval(interval)
      if (cleanup) cleanup()
    }
  }, [])

  // Calculate the maximum end time (in frames) for video items only
  // This ensures the video ends when the last video item ends, regardless of audio length
  const durationInFrames = (() => {
    let maxEndFrame = 0

    tracks.forEach(track => {
      track.items.forEach(item => {
        // Only consider video items for determining the composition duration
        if (item.type === 'video') {
          const itemEndFrame = item.from + item.durationInFrames
          if (itemEndFrame > maxEndFrame) {
            maxEndFrame = itemEndFrame
          }
        }
      })
    })

    // Return the calculated duration, with a minimum of 1 frame
    return Math.max(maxEndFrame, 1)
  })()

  // Helper to check for collision in a track
  function hasCollision(items: Item[], movingItem: Item, newStartFrame: number, ignoreIndex?: number): boolean {
    const movingEnd = newStartFrame + movingItem.durationInFrames
    return items.some((item, idx) => {
      if (ignoreIndex !== undefined && idx === ignoreIndex) return false
      const itemStart = item.from
      const itemEnd = item.from + item.durationInFrames
      // Overlap if not (end before start or start after end)
      return !(movingEnd <= itemStart || newStartFrame >= itemEnd)
    })
  }

  // Move item between tracks with collision detection
  function moveItemToTrack(
    sourceTrackIndex: number,
    itemIndex: number,
    targetTrackIndex: number,
    newStartFrame: number
  ): boolean {
    setTracks(prevTracks => {
      const sourceTrack = prevTracks[sourceTrackIndex]
      const targetTrack = prevTracks[targetTrackIndex]
      let movingItem = { ...sourceTrack.items[itemIndex], from: newStartFrame }

      // Check for collision in target track
      const hasCollision = targetTrack.items.some(item => {
        const itemStart = item.from
        const itemEnd = item.from + item.durationInFrames
        const movingEnd = newStartFrame + movingItem.durationInFrames
        return !(movingEnd <= itemStart || newStartFrame >= itemEnd)
      })

      let newTargetItems
      if (hasCollision) {
        // Place after last item
        const last = targetTrack.items[targetTrack.items.length - 1]
        const forcedStart = last ? last.from + last.durationInFrames : 0
        movingItem = { ...movingItem, from: forcedStart }
        newTargetItems = [...targetTrack.items, movingItem]
      } else {
        newTargetItems = [...targetTrack.items, movingItem]
      }

      // Remove from source
      const newSourceItems = sourceTrack.items.filter((_, idx) => idx !== itemIndex)

      // Apply gravity to both tracks
      const gravitatedSourceItems = applyGravityToTrack(newSourceItems)
      const gravitatedTargetItems = applyGravityToTrack(newTargetItems)

      const newTracks = prevTracks.map((track, idx) => {
        if (idx === sourceTrackIndex) return { ...track, items: gravitatedSourceItems }
        if (idx === targetTrackIndex) return { ...track, items: gravitatedTargetItems }
        return track
      })
      return newTracks
    })
    return true
  }

  // Handle track volume changes
  const handleTrackVolumeChange = (trackIndex: number, volume: number) => {
    setTracks(prevTracks => {
      const newTracks = [...prevTracks]
      newTracks[trackIndex] = {
        ...newTracks[trackIndex],
        volume
      }
      return newTracks
    })
  }

  // Handle audio item volume changes
  const handleAudioItemVolumeChange = (itemId: string, volume: number) => {
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const updatedItems = track.items.map(item => {
          if (item.id === itemId && item.type === 'audio') {
            return {
              ...item,
              volume
            }
          }
          return item
        })
        return {
          ...track,
          items: updatedItems
        }
      })
    })
  }

  const contextValue: EditorContextState = {
    tracks,
    setTracks,
    playerRef,
    isPlaying,
    currentTime,
    isLooping,
    setIsLooping,
    originalVideoDuration,
    durationInFrames,
    togglePlayPause,
    handleTimeUpdate,
    toggleLoop,
    handleTrackUpdate,
    handleTrackVolumeChange,
    handleAudioItemVolumeChange,
    moveItemToTrack
  }

  return <EditorContext.Provider value={contextValue}>{children}</EditorContext.Provider>
}

export const useEditor = (): EditorContextState => {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
