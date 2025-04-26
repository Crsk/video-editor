import { useSensor, useSensors, PointerSensor, KeyboardSensor, Modifier } from '@dnd-kit/core'
import type { DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core'
import { useEditor } from '../../context/editor-context'
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
    setSelectedItem,
    setActiveItem,
    activeItem,
    setActiveItemTrackIndex,
    activeItemTrackIndex,
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

    if (active.data.current?.type === 'track-item') {
      const { item, trackIndex, itemIndex } = active.data.current
      setActiveItem(item)
      setActiveItemTrackIndex(trackIndex)
      setActiveItemIndex(itemIndex)
      setSelectedItem({ trackIndex, itemIndex })
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

    if (active.data.current?.type === 'track-item' && activeItemTrackIndex !== null && activeItemIndex !== null) {
      const sourceTrackIndex = activeItemTrackIndex
      const itemIndex = activeItemIndex
      const currentItem = tracks[sourceTrackIndex].items[itemIndex]

      if (!currentItem) return

      let targetTrackIndex = sourceTrackIndex
      if (over && typeof over.id === 'string' && over.id.startsWith('track-')) {
        const parsed = parseInt(over.id.replace('track-', ''), 10)
        if (!isNaN(parsed)) targetTrackIndex = parsed
      }

      const deltaXInPixels = delta.x
      const deltaTimeInSeconds = deltaXInPixels / pixelsPerSecond
      const deltaFrames = Math.round(deltaTimeInSeconds * FPS)
      const newTrackStartFrame = Math.max(0, currentItem.from + deltaFrames)

      if (targetTrackIndex !== sourceTrackIndex) {
        const moveSucceeded = moveItemToTrack(sourceTrackIndex, itemIndex, targetTrackIndex, newTrackStartFrame)

        if (!moveSucceeded) {
          // TODO: show visual feedback for collision
        }
      } else {
        const updatedItems = [...tracks[sourceTrackIndex].items]
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
          handleTrackUpdate(sourceTrackIndex, updatedItems)
        } else {
          // Optionally feedback
        }
      }

      setActiveItem(null)
      setActiveItemTrackIndex(null)
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
