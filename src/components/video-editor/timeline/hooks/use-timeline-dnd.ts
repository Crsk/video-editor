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
      setActiveClipIndex(ClipIndex)
      setSelectedClip({ clipIndex, ClipIndex })
      setIsDragging(true)
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

    if (active.data.current?.type === 'clip' && activeClipIndex !== null && activeClipIndex !== null) {
      const sourceClipIndex = activeClipIndex
      const ClipIndex = activeClipIndex
      const currentClip = tracks[sourceClipIndex].clips[ClipIndex]

      if (!currentClip) return

      let targetClipIndex = sourceClipIndex
      if (over && typeof over.id === 'string' && over.id.startsWith('clip-')) {
        const parsed = parseInt(over.id.replace('clip-', ''), 10)
        if (!isNaN(parsed)) targetClipIndex = parsed
      }

      const deltaXInPixels = delta.x
      const deltaTimeInSeconds = deltaXInPixels / pixelsPerSecond
      const deltaFrames = Math.round(deltaTimeInSeconds * FPS)
      const newTrackStartFrame = Math.max(0, currentClip.from + deltaFrames)

      if (targetClipIndex !== sourceClipIndex) {
        const moveSucceeded = moveClipToTrack(sourceClipIndex, ClipIndex, targetClipIndex, newTrackStartFrame)

        if (!moveSucceeded) {
          // TODO: show visual feedback for collision
        }
      } else {
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

      setActiveClip(null)
      setActiveClipIndex(null)
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
