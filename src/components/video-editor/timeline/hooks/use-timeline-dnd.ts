import { useSensor, useSensors, PointerSensor, KeyboardSensor, Modifier } from '@dnd-kit/core'
import type { DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core'
import { useEditor } from '../../context/video-editor-provider'
import { getSnappedDropPosition } from '../find-gap-integration'
import type { Clip } from '../../types'
import type { TimelineState } from './use-timeline'

const FPS = 30

export interface TimelineDnd {
  sensors: ReturnType<typeof useSensors>
  handleDragStart: (event: DragStartEvent) => void
  handleDragMove: (event: DragMoveEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  modifiers: Modifier[]
  activeClip: Clip | null
}

export const useTimelineDnd = (timelineState: TimelineState): TimelineDnd => {
  const { moveClipToTrack, handleTrackUpdate, tracks } = useEditor()

  const {
    setIsDragging,
    setSelectedClip,
    setActiveClip,
    activeClip,
    setActiveClipIndex,
    activeClipIndex,
    timelineContainerRef,
    pixelsPerSecond
  } = timelineState

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor)
  )

  const snapToGridModifier: Modifier = ({ transform }) => {
    const snapSize = 15
    return {
      ...transform,
      x: Math.round(transform.x / snapSize) * snapSize,
      y: 0
    }
  }

  const modifiers = [snapToGridModifier]

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event

    if (active.data.current?.type === 'clip') {
      const { clip, clipIndex, ClipIndex } = active.data.current
      setActiveClip(clip)
      setActiveClipIndex(clipIndex)
      setSelectedClip({ clipIndex, ClipIndex })
      setIsDragging(true)

      console.log(`Drag start: Track ${clipIndex}, Clip ${ClipIndex}`)
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    if (!timelineContainerRef.current) return

    const container = timelineContainerRef.current
    const { clientX } = event.activatorEvent as MouseEvent
    const containerRect = container.getBoundingClientRect()

    // Auto-scroll when near edges
    const scrollThreshold = 50 // pixels from edge

    if (clientX < containerRect.left + scrollThreshold) {
      // Scroll left
      container.scrollBy({ left: -10, behavior: 'auto' })
    } else if (clientX > containerRect.right - scrollThreshold) {
      // Scroll right
      container.scrollBy({ left: 10, behavior: 'auto' })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta, over } = event

    if (active.data.current?.type === 'clip' && activeClipIndex !== null) {
      // Get the source track index and clip index from the active element's data
      const { clipIndex: sourceClipIndex, ClipIndex } = active.data.current
      console.log(`Drag end: Source track ${sourceClipIndex}, Clip ${ClipIndex}`)

      const currentClip = tracks[sourceClipIndex]?.clips[ClipIndex]
      if (!currentClip) {
        console.error('Current clip not found')
        setIsDragging(false)
        setActiveClip(null)
        setActiveClipIndex(null)
        return
      }

      // Default target is the same as source
      let targetClipIndex = sourceClipIndex

      // Check if we're dropping over a track
      if (over) {
        console.log(`Dropping over: ${over.id}`)
        // Extract track index from over.id
        if (typeof over.id === 'string') {
          // Handle both formats: 'clip-X' and 'track-X'
          if (over.id.startsWith('clip-')) {
            const parsed = parseInt(over.id.replace('clip-', ''), 10)
            if (!isNaN(parsed)) targetClipIndex = parsed
          } else if (over.id.startsWith('track-')) {
            const parsed = parseInt(over.id.replace('track-', ''), 10)
            if (!isNaN(parsed)) targetClipIndex = parsed
          }
        }
      }

      const deltaXInPixels = delta.x
      const deltaTimeInSeconds = deltaXInPixels / pixelsPerSecond
      const deltaFrames = Math.round(deltaTimeInSeconds * FPS)
      const newTrackStartFrame = Math.max(0, currentClip.from + deltaFrames)

      if (targetClipIndex !== sourceClipIndex) {
        console.log(`Moving clip from track ${sourceClipIndex} to track ${targetClipIndex}`)
        const moveSucceeded = moveClipToTrack(sourceClipIndex, ClipIndex, targetClipIndex, newTrackStartFrame)
        console.log(`Move succeeded: ${moveSucceeded}`)
      } else {
        // Moving within the same track
        const updatedClips = [...tracks[sourceClipIndex].clips]
        const snappedGap = getSnappedDropPosition({
          clips: updatedClips,
          desiredStartFrame: newTrackStartFrame,
          durationInFrames: currentClip.durationInFrames,
          ignoreClipId: currentClip.id,
          snapToGrid: 1
        })
        if (snappedGap !== null) {
          updatedClips[ClipIndex] = {
            ...currentClip,
            from: snappedGap
          }
          handleTrackUpdate(sourceClipIndex, updatedClips)
        } else {
          // Optionally feedback
        }
      }

      // Reset state
      setActiveClip(null)
      setActiveClipIndex(null)
      setIsDragging(false)
    }
  }

  return {
    sensors,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    modifiers,
    activeClip
  }
}
