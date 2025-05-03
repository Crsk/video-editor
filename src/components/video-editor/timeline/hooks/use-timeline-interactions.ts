import { useEditor } from '../../context/video-editor-provider'
import { getResizeOverlayRect } from '../overlay-utils'
import { calculateResizedWidth } from '../calculate-resized-width'
import type { TimelineState } from './use-timeline'

const FPS = 30

export interface TimelineInteractions {
  handleTimelineClick: (e: React.MouseEvent) => void
  handleMarkerDrag: (startEvent: React.MouseEvent) => void
  handleItemSelect: (clipIndex: number, itemIndex: number) => void
  handleResizeStart: (e: React.MouseEvent, mode: 'left' | 'right') => void
}

export const useTimelineInteractions = (timelineState: TimelineState): TimelineInteractions => {
  const { handleTimeUpdate, handleTrackUpdate, tracks } = useEditor()

  const {
    calculateTimeFromClick,
    isDragging,
    setIsDragging,
    setSelectedClip,
    selectedClip,
    timelineContainerRef,
    trackRefs,
    pixelsPerSecond,
    setResizeMode,
    setResizeOverlay
  } = timelineState

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (isDragging) return

    const target = e.target as HTMLElement
    const isItem = target.closest('.timeline-item') !== null
    const isResizeHandle = target.closest('.resize-handle') !== null

    if (!isItem && !isResizeHandle) {
      setSelectedClip(null)
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

  const handleItemSelect = (clipIndex: number, itemIndex: number) => {
    if (selectedClip && selectedClip.clipIndex === clipIndex && selectedClip.itemIndex === itemIndex) {
      setSelectedClip(null)
    } else setSelectedClip({ clipIndex, itemIndex })
  }

  const handleResizeStart = (e: React.MouseEvent, mode: 'left' | 'right') => {
    e.stopPropagation()
    setResizeMode(mode)

    const MIN_DURATION_SECONDS = 0.5

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!selectedClip) return

      const clipIndex = selectedClip.clipIndex
      const itemIndex = selectedClip.itemIndex
      const currentItem = tracks[clipIndex].items[itemIndex]

      if (!currentItem) return

      const containerRect = timelineContainerRef.current?.getBoundingClientRect()
      if (!containerRect) return
      const scrollLeft = timelineContainerRef.current?.scrollLeft || 0
      const mouseX = moveEvent.clientX - containerRect.left + scrollLeft
      const trackRect = trackRefs.current[clipIndex]?.getBoundingClientRect() ?? null
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

        // Check minimum duration constraint
        if (newDurationInFrames < MIN_DURATION_SECONDS * FPS) return

        // Check original duration constraint - only for video clips
        if (
          currentItem.type === 'video' &&
          currentItem.originalDuration &&
          newDurationInFrames > currentItem.originalDuration
        )
          return

        const updatedItems = [...tracks[clipIndex].items]
        updatedItems[itemIndex] = {
          ...currentItem,
          from: newStartFrame,
          durationInFrames: newDurationInFrames
        }

        handleTrackUpdate(clipIndex, updatedItems)
      } else {
        // Right resize - changes only duration
        const containerRect = timelineContainerRef.current?.getBoundingClientRect()
        if (!containerRect) return

        const scrollLeft = timelineContainerRef.current?.scrollLeft || 0
        const mouseX = moveEvent.clientX - containerRect.left + scrollLeft
        const itemStartX = (currentItem.from / FPS) * pixelsPerSecond

        // We'll use the current item's duration for calculations

        // Calculate the original duration in seconds if available - only for video clips
        const originalDurationSeconds =
          currentItem.type === 'video' && currentItem.originalDuration ? currentItem.originalDuration / FPS : undefined

        const newWidthPixels = calculateResizedWidth({
          mode: 'right',
          mouseX,
          itemStartX,
          pixelsPerSecond,
          minDurationSeconds: MIN_DURATION_SECONDS,
          maxDurationSeconds: undefined, // Remove the restriction on max duration for trimming
          originalDurationSeconds // Pass the original duration to limit expansion
        })
        const newDurationSeconds = newWidthPixels / pixelsPerSecond

        if (newDurationSeconds < MIN_DURATION_SECONDS) return

        // We don't need to restrict the trim operation when reducing the clip size
        // The user should be able to trim the video to any smaller size

        const updatedItems = [...tracks[clipIndex].items]
        updatedItems[itemIndex] = {
          ...currentItem,
          durationInFrames: Math.round(newDurationSeconds * FPS)
        }

        handleTrackUpdate(clipIndex, updatedItems)
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
