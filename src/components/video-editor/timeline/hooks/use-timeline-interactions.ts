import { useEditor } from '../../context/editor-context'
import { getResizeOverlayRect } from '../overlay-utils'
import { calculateResizedWidth } from '../calculate-resized-width'
import type { TimelineState } from './use-timeline'

const FPS = 30

export interface TimelineInteractions {
  handleTimelineClick: (e: React.MouseEvent) => void
  handleMarkerDrag: (startEvent: React.MouseEvent) => void
  handleItemSelect: (trackIndex: number, itemIndex: number) => void
  handleResizeStart: (e: React.MouseEvent, mode: 'left' | 'right') => void
}

export const useTimelineInteractions = (timelineState: TimelineState): TimelineInteractions => {
  const { handleTimeUpdate, handleTrackUpdate, tracks } = useEditor()

  const {
    calculateTimeFromClick,
    isDragging,
    setIsDragging,
    setSelectedItem,
    selectedItem,
    timelineContainerRef,
    trackRefs,
    pixelsPerSecond,
    setResizeMode,
    setResizeOverlay,
    originalVideoDurationInSeconds
  } = timelineState

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (isDragging) return

    const target = e.target as HTMLElement
    const isItem = target.closest('.timeline-item') !== null
    const isResizeHandle = target.closest('.resize-handle') !== null

    if (!isItem && !isResizeHandle) {
      setSelectedItem(null)
      e.preventDefault()

      setIsDragging(true)
      document.body.classList.add('timeline-dragging')

      const initialTime = calculateTimeFromClick(e.clientX)
      handleTimeUpdate(initialTime)

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newTime = calculateTimeFromClick(moveEvent.clientX)
        handleTimeUpdate(newTime)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.classList.remove('timeline-dragging')
        setIsDragging(false)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
  }

  const handleMarkerDrag = (startEvent: React.MouseEvent) => {
    startEvent.preventDefault()
    setIsDragging(true)
    document.body.classList.add('timeline-dragging')
    const initialTime = calculateTimeFromClick(startEvent.clientX)
    handleTimeUpdate(initialTime)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newTime = calculateTimeFromClick(moveEvent.clientX)
      handleTimeUpdate(newTime)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('timeline-dragging')
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleItemSelect = (trackIndex: number, itemIndex: number) => {
    setSelectedItem({ trackIndex, itemIndex })
  }

  const handleResizeStart = (e: React.MouseEvent, mode: 'left' | 'right') => {
    e.stopPropagation()
    setResizeMode(mode)

    const MIN_DURATION_SECONDS = 0.5

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!selectedItem) return

      const trackIndex = selectedItem.trackIndex
      const itemIndex = selectedItem.itemIndex
      const currentItem = tracks[trackIndex].items[itemIndex]

      if (!currentItem) return

      const containerRect = timelineContainerRef.current?.getBoundingClientRect()
      if (!containerRect) return
      const scrollLeft = timelineContainerRef.current?.scrollLeft || 0
      const mouseX = moveEvent.clientX - containerRect.left + scrollLeft
      const trackRect = trackRefs.current[trackIndex]?.getBoundingClientRect() ?? null
      setResizeOverlay(
        getResizeOverlayRect({
          mode,
          currentItem,
          mouseX,
          pixelsPerSecond,
          minDurationSeconds: MIN_DURATION_SECONDS,
          trackRect,
          containerRect,
          scrollLeft
        })
      )

      if (mode === 'left') {
        const containerRect = timelineContainerRef.current?.getBoundingClientRect()
        if (!containerRect) return

        const scrollLeft = timelineContainerRef.current?.scrollLeft || 0
        const mouseX = moveEvent.clientX - containerRect.left + scrollLeft
        const newStartSeconds = mouseX / pixelsPerSecond
        const originalEndFrame = currentItem.from + currentItem.durationInFrames
        const newStartFrame = Math.max(0, Math.round(newStartSeconds * FPS))
        const newDurationInFrames = originalEndFrame - newStartFrame

        if (newDurationInFrames < MIN_DURATION_SECONDS * FPS) return

        const updatedItems = [...tracks[trackIndex].items]
        updatedItems[itemIndex] = {
          ...currentItem,
          from: newStartFrame,
          durationInFrames: newDurationInFrames
        }

        handleTrackUpdate(trackIndex, updatedItems)
      } else {
        // Right resize - changes only duration
        const containerRect = timelineContainerRef.current?.getBoundingClientRect()
        if (!containerRect) return

        const scrollLeft = timelineContainerRef.current?.scrollLeft || 0
        const mouseX = moveEvent.clientX - containerRect.left + scrollLeft
        const itemStartX = (currentItem.from / FPS) * pixelsPerSecond
        const newWidthPixels = calculateResizedWidth({
          mode: 'right',
          mouseX,
          itemStartX,
          pixelsPerSecond,
          minDurationSeconds: MIN_DURATION_SECONDS,
          maxDurationSeconds: originalVideoDurationInSeconds !== Infinity ? originalVideoDurationInSeconds : undefined
        })
        const newDurationSeconds = newWidthPixels / pixelsPerSecond

        if (newDurationSeconds < MIN_DURATION_SECONDS) return

        const videoItem = currentItem.type === 'video' ? currentItem : null
        if (
          videoItem &&
          originalVideoDurationInSeconds !== Infinity &&
          newDurationSeconds > originalVideoDurationInSeconds
        ) {
          return
        }

        const updatedItems = [...tracks[trackIndex].items]
        updatedItems[itemIndex] = {
          ...currentItem,
          durationInFrames: Math.round(newDurationSeconds * FPS)
        }

        handleTrackUpdate(trackIndex, updatedItems)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setResizeMode(null)
      setResizeOverlay(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return {
    handleTimelineClick,
    handleMarkerDrag,
    handleItemSelect,
    handleResizeStart
  }
}
