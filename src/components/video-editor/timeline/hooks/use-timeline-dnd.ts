import { useSensor, useSensors, PointerSensor, KeyboardSensor, Modifier } from '@dnd-kit/core'
import type { DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core'
import { useEditor } from '../../context/video-editor-provider'
import { getSnappedDropPosition } from '../find-gap-integration'
import type { Item } from '../../types'
import type { TimelineState } from './use-timeline'

const FPS = 30

export interface TimelineDnd {
  sensors: ReturnType<typeof useSensors>
  handleDragStart: (event: DragStartEvent) => void
  handleDragMove: (event: DragMoveEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  modifiers: Modifier[]
  activeItem: Item | null
}

export const useTimelineDnd = (timelineState: TimelineState): TimelineDnd => {
  const { moveItemToTrack, handleTrackUpdate, tracks } = useEditor()

  const {
    setIsDragging,
    setSelectedClip,
    setActiveItem,
    activeItem,
    setActiveItemClipIndex,
    activeItemClipIndex,
    setActiveItemIndex,
    activeItemIndex,
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
      const { item, clipIndex, itemIndex } = active.data.current
      setActiveItem(item)
      setActiveItemClipIndex(clipIndex)
      setActiveItemIndex(itemIndex)
      setSelectedClip({ clipIndex, itemIndex })
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

    if (active.data.current?.type === 'clip' && activeItemClipIndex !== null && activeItemIndex !== null) {
      const sourceClipIndex = activeItemClipIndex
      const itemIndex = activeItemIndex
      const currentItem = tracks[sourceClipIndex].items[itemIndex]

      if (!currentItem) return

      let targetClipIndex = sourceClipIndex
      if (over && typeof over.id === 'string' && over.id.startsWith('clip-')) {
        const parsed = parseInt(over.id.replace('clip-', ''), 10)
        if (!isNaN(parsed)) targetClipIndex = parsed
      }

      const deltaXInPixels = delta.x
      const deltaTimeInSeconds = deltaXInPixels / pixelsPerSecond
      const deltaFrames = Math.round(deltaTimeInSeconds * FPS)
      const newTrackStartFrame = Math.max(0, currentItem.from + deltaFrames)

      if (targetClipIndex !== sourceClipIndex) {
        const moveSucceeded = moveItemToTrack(sourceClipIndex, itemIndex, targetClipIndex, newTrackStartFrame)

        if (!moveSucceeded) {
          // TODO: show visual feedback for collision
        }
      } else {
        const updatedItems = [...tracks[sourceClipIndex].items]
        const snappedGap = getSnappedDropPosition({
          items: updatedItems,
          desiredStartFrame: newTrackStartFrame,
          durationInFrames: currentItem.durationInFrames,
          ignoreItemId: currentItem.id,
          snapToGrid: 1
        })
        if (snappedGap !== null) {
          updatedItems[itemIndex] = {
            ...currentItem,
            from: snappedGap
          }
          handleTrackUpdate(sourceClipIndex, updatedItems)
        } else {
          // Optionally feedback
        }
      }

      setActiveItem(null)
      setActiveItemClipIndex(null)
      setActiveItemIndex(null)
      setIsDragging(false)
    }
  }

  return {
    sensors,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    modifiers,
    activeItem
  }
}
