import { createContext, useContext, useState, useRef, useEffect, ReactNode, FC, RefObject } from 'react'
import { PlayerRef } from '@remotion/player'
import { Track, Item } from '../types'
import { useVideoLoader } from '../hooks/use-video-loader'
import { useAudioLoader } from '../hooks/use-audio-loader'
import { applyGravityToTrack } from './gravity'
import { RemotionTimelineProvider } from '../timeline/context/remotion-timeline-context'

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
  handleTrackUpdate: (clipIndex: number, updatedItems: Item[]) => void
  handleTrackVolumeChange: (clipIndex: number, volume: number) => void
  handleAudioItemVolumeChange: (itemId: string, volume: number) => void
  handleVideoRenderOptionChange: (itemId: string, renderOption: 'default' | 'contain-blur' | 'cover') => void
  handleVideoPositionChange: (itemId: string, positionX: number, positionY: number) => void
  handleDeleteItem: (clipIndex: number, itemIndex: number) => void

  // Move item between tracks with collision detection
  moveItemToTrack: (
    sourceClipIndex: number,
    itemIndex: number,
    targetClipIndex: number,
    newStartFrame: number
  ) => boolean // returns true if move succeeded, false if collision
}

// Create the context with a default undefined value
const EditorContext = createContext<EditorContextState | undefined>(undefined)

interface VideoEditorProviderProps {
  children: ReactNode
  initialTracks?: Track[]
}

const FPS = 30

export const VideoEditorProvider: FC<VideoEditorProviderProps> = ({
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
  const handleTrackUpdate = (clipIndex: number, updatedItems: Item[]) => {
    setTracks(prevTracks => {
      const newTracks = [...prevTracks]
      newTracks[clipIndex] = {
        ...newTracks[clipIndex],
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

  // Move item between tracks with collision detection
  function moveItemToTrack(
    sourceClipIndex: number,
    itemIndex: number,
    targetClipIndex: number,
    newStartFrame: number
  ): boolean {
    setTracks(prevTracks => {
      const sourceTrack = prevTracks[sourceClipIndex]
      const targetTrack = prevTracks[targetClipIndex]
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
        if (idx === sourceClipIndex) return { ...track, items: gravitatedSourceItems }
        if (idx === targetClipIndex) return { ...track, items: gravitatedTargetItems }
        return track
      })
      return newTracks
    })
    return true
  }

  // Handle track volume changes
  const handleTrackVolumeChange = (clipIndex: number, volume: number) => {
    setTracks(prevTracks => {
      const newTracks = [...prevTracks]
      newTracks[clipIndex] = {
        ...newTracks[clipIndex],
        volume
      }
      return newTracks
    })
  }

  const handleAudioItemVolumeChange = (itemId: string, volume: number) => {
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const updatedItems = track.items.map(item => {
          if (item.id === itemId && (item.type === 'audio' || item.type === 'video')) {
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

  // Handle video render option changes
  const handleVideoRenderOptionChange = (itemId: string, renderOption: 'default' | 'contain-blur' | 'cover') => {
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const updatedItems = track.items.map(item => {
          if (item.id === itemId && item.type === 'video') {
            return {
              ...item,
              renderOption
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

  // Handle video position changes for centering
  const handleVideoPositionChange = (itemId: string, positionX: number, positionY: number) => {
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const updatedItems = track.items.map(item => {
          if (item.id === itemId && item.type === 'video') {
            return {
              ...item,
              positionX,
              positionY
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

  // Handle deleting an item from a track
  const handleDeleteItem = (clipIndex: number, itemIndex: number) => {
    if (clipIndex < 0 || clipIndex >= tracks.length) return

    setTracks(prevTracks => {
      // Create a deep copy to avoid reference issues
      const newTracks = JSON.parse(JSON.stringify(prevTracks))

      // Make sure the item exists before trying to delete it
      if (itemIndex >= 0 && itemIndex < newTracks[clipIndex].items.length) {
        // Remove the item at the specified index
        newTracks[clipIndex].items.splice(itemIndex, 1)
        console.log(`Deleted item at track ${clipIndex}, index ${itemIndex}`)
      }

      return newTracks
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
    handleVideoRenderOptionChange,
    handleVideoPositionChange,
    handleDeleteItem,
    moveItemToTrack
  }

  return (
    <EditorContext.Provider value={contextValue}>
      <RemotionTimelineProvider>{children}</RemotionTimelineProvider>
    </EditorContext.Provider>
  )
}

export const useEditor = (): EditorContextState => {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within an VideoEditorProvider')
  }
  return context
}
