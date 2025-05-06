import { createContext, useContext, useState, useRef, useEffect, ReactNode, FC, RefObject } from 'react'
import { PlayerRef } from '@remotion/player'
import { Track, Clip } from '../types'
import { useMediaLoader } from '../hooks/use-media-loader'
import { applyGravityToTrack } from './gravity'
import { RemotionTimelineProvider } from '../timeline/context/remotion-timeline-context'
import { v4 as uuidv4 } from 'uuid'

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
  originalAudioDuration: number | null

  // Timeline state
  durationInFrames: number

  // Player controls
  togglePlayPause: () => void
  handleTimeUpdate: (newTimeInSeconds: number) => void
  toggleLoop: () => void
  handleTrackUpdate: (clipIndex: number, updatedClips: Clip[]) => void
  handleTrackVolumeChange: (clipIndex: number, volume: number) => void
  handleAudioClipVolumeChange: (ClipId: string, volume: number) => void
  handleVideoRenderOptionChange: (ClipId: string, renderOption: 'default' | 'contain-blur' | 'cover') => void
  handleVideoPositionChange: (ClipId: string, positionX: number, positionY: number) => void
  handleVideoZoomChange: (ClipId: string, zoom: number) => void
  handleDeleteClip: (clipIndex: number, ClipIndex: number) => void
  handleSplitClip: (clipIndex: number, ClipIndex: number, splitTimeInFrames: number) => void

  // Move clip between tracks with collision detection
  moveClipToTrack: (
    sourceClipIndex: number,
    ClipIndex: number,
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
      clips: [
        {
          id: 'clip-1',
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
      clips: [
        {
          id: 'clip-2',
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
      clips: [
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
  const [originalAudioDuration, setOriginalAudioDuration] = useState<number | null>(null)

  // Use the media loader hook to handle media loading and duration calculation
  useMediaLoader(tracks, setTracks, {
    video: setOriginalVideoDuration,
    audio: setOriginalAudioDuration
  })

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

  // Handle track updates (for resizing video clips)
  const handleTrackUpdate = (clipIndex: number, updatedClips: Clip[]) => {
    setTracks(prevTracks => {
      const newTracks = [...prevTracks]
      newTracks[clipIndex] = {
        ...newTracks[clipIndex],
        clips: applyGravityToTrack(updatedClips)
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

  // Calculate the maximum end time (in frames) for video clips only
  // This ensures the video ends when the last video clip ends, regardless of audio length
  const durationInFrames = (() => {
    let maxEndFrame = 0

    tracks.forEach(track => {
      track.clips.forEach(clip => {
        // Only consider video clips for determining the composition duration
        if (clip.type === 'video') {
          const ClipEndFrame = clip.from + clip.durationInFrames
          if (ClipEndFrame > maxEndFrame) {
            maxEndFrame = ClipEndFrame
          }
        }
      })
    })

    // Return the calculated duration, with a minimum of 1 frame
    return Math.max(maxEndFrame, 1)
  })()

  // Move clip between tracks with collision detection
  function moveClipToTrack(
    sourceClipIndex: number,
    ClipIndex: number,
    targetClipIndex: number,
    newStartFrame: number
  ): boolean {
    setTracks(prevTracks => {
      // Make sure we have valid indices
      if (
        sourceClipIndex < 0 ||
        sourceClipIndex >= prevTracks.length ||
        targetClipIndex < 0 ||
        targetClipIndex >= prevTracks.length ||
        ClipIndex < 0 ||
        ClipIndex >= prevTracks[sourceClipIndex].clips.length
      ) {
        return prevTracks
      }

      const sourceTrack = prevTracks[sourceClipIndex]
      const targetTrack = prevTracks[targetClipIndex]
      let movingClip = { ...sourceTrack.clips[ClipIndex], from: newStartFrame }

      // Check for collision in target track
      const hasCollision = targetTrack.clips.some(clip => {
        const ClipStart = clip.from
        const ClipEnd = clip.from + clip.durationInFrames
        const movingEnd = newStartFrame + movingClip.durationInFrames
        return !(movingEnd <= ClipStart || newStartFrame >= ClipEnd)
      })

      let newTargetClips
      if (hasCollision) {
        // Place after last clip
        const last = targetTrack.clips[targetTrack.clips.length - 1]
        const forcedStart = last ? last.from + last.durationInFrames : 0
        movingClip = { ...movingClip, from: forcedStart }
        newTargetClips = [...targetTrack.clips, movingClip]
      } else {
        newTargetClips = [...targetTrack.clips, movingClip]
      }

      // Remove from source
      const newSourceClips = sourceTrack.clips.filter((_, idx) => idx !== ClipIndex)

      // Apply gravity to both tracks
      const gravitatedSourceClips = applyGravityToTrack(newSourceClips)
      const gravitatedTargetClips = applyGravityToTrack(newTargetClips)

      // Create a new array of tracks with the updated source and target tracks
      return prevTracks.map((track, idx) => {
        if (idx === sourceClipIndex) return { ...track, clips: gravitatedSourceClips }
        if (idx === targetClipIndex) return { ...track, clips: gravitatedTargetClips }
        return track
      })
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

  const handleAudioClipVolumeChange = (ClipId: string, volume: number) => {
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const updatedClips = track.clips.map(clip => {
          if (clip.id === ClipId && (clip.type === 'audio' || clip.type === 'video')) {
            return {
              ...clip,
              volume
            }
          }
          return clip
        })
        return {
          ...track,
          clips: updatedClips
        }
      })
    })
  }

  // Handle video render option changes
  const handleVideoRenderOptionChange = (ClipId: string, renderOption: 'default' | 'contain-blur' | 'cover') => {
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const updatedClips = track.clips.map(clip => {
          if (clip.id === ClipId && clip.type === 'video') {
            return {
              ...clip,
              renderOption
            }
          }
          return clip
        })
        return {
          ...track,
          clips: updatedClips
        }
      })
    })
  }

  // Handle video position changes for centering
  const handleVideoPositionChange = (ClipId: string, positionX: number, positionY: number) => {
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const updatedClips = track.clips.map(clip => {
          if (clip.id === ClipId && clip.type === 'video') {
            return {
              ...clip,
              positionX,
              positionY
            }
          }
          return clip
        })
        return {
          ...track,
          clips: updatedClips
        }
      })
    })
  }

  // Handle video zoom changes
  const handleVideoZoomChange = (ClipId: string, zoom: number) => {
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const updatedClips = track.clips.map(clip => {
          if (clip.id === ClipId && clip.type === 'video') {
            return {
              ...clip,
              zoom
            }
          }
          return clip
        })
        return {
          ...track,
          clips: updatedClips
        }
      })
    })
  }

  // Handle deleting an clip from a track
  const handleDeleteClip = (clipIndex: number, ClipIndex: number) => {
    if (clipIndex < 0 || clipIndex >= tracks.length) return

    setTracks(prevTracks => {
      // Create a deep copy to avoid reference issues
      const newTracks = JSON.parse(JSON.stringify(prevTracks))

      // Make sure the clip exists before trying to delete it
      if (ClipIndex >= 0 && ClipIndex < newTracks[clipIndex].clips.length) {
        // Remove the clip at the specified index
        newTracks[clipIndex].clips.splice(ClipIndex, 1)
        console.log(`Deleted clip at track ${clipIndex}, index ${ClipIndex}`)
      }

      return newTracks
    })
  }

  const handleSplitClip = (clipIndex: number, ClipIndex: number, splitTimeInFrames: number) => {
    if (clipIndex < 0 || clipIndex >= tracks.length) return

    setTracks(prevTracks => {
      const newTracks = JSON.parse(JSON.stringify(prevTracks))

      if (ClipIndex < 0 || ClipIndex >= newTracks[clipIndex].clips.length) return newTracks

      const track = newTracks[clipIndex]
      const clipToSplit = track.clips[ClipIndex]

      const clipStartFrame = clipToSplit.from
      const clipEndFrame = clipStartFrame + clipToSplit.durationInFrames

      if (splitTimeInFrames <= clipStartFrame || splitTimeInFrames >= clipEndFrame) {
        console.warn('Split point is outside clip boundaries')
        return newTracks
      }

      const firstClipDuration = splitTimeInFrames - clipStartFrame
      const secondClipDuration = clipEndFrame - splitTimeInFrames

      if (clipToSplit.type === 'video') {
        const relativePositionInClip = firstClipDuration
        const currentOffset = clipToSplit.offset || 0

        const firstClip = {
          ...clipToSplit,
          durationInFrames: firstClipDuration
        }

        const secondClip = {
          ...clipToSplit,
          id: uuidv4(),
          from: splitTimeInFrames,
          durationInFrames: secondClipDuration,
          offset: currentOffset + relativePositionInClip
        }

        track.clips.splice(ClipIndex, 1, firstClip, secondClip)
      } else {
        const firstClip = {
          ...clipToSplit,
          durationInFrames: firstClipDuration
        }

        const secondClip = {
          ...clipToSplit,
          id: uuidv4(),
          from: splitTimeInFrames,
          durationInFrames: secondClipDuration
        }

        track.clips.splice(ClipIndex, 1, firstClip, secondClip)
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
    originalAudioDuration,
    durationInFrames,
    togglePlayPause,
    handleTimeUpdate,
    toggleLoop,
    handleTrackUpdate,
    handleTrackVolumeChange,
    handleAudioClipVolumeChange,
    handleVideoRenderOptionChange,
    handleVideoPositionChange,
    handleVideoZoomChange,
    handleDeleteClip,
    handleSplitClip,
    moveClipToTrack
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
