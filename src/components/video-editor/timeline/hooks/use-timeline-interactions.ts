import { useEditor } from '../../context/video-editor-provider'
import { getResizeOverlayRect } from '../overlay-utils'
import { calculateResizedWidth } from '../calculate-resized-width'
import type { TimelineState } from './use-timeline'

const FPS = 30

export interface TimelineInteractions {
  handleTimelineClick: (e: React.MouseEvent) => void
  handleMarkerDrag: (startEvent: React.MouseEvent) => void
  handleClipSelect: (clipIndex: number, ClipIndex: number) => void
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
    const isClip = target.closest('.timeline-clip') !== null
    const isResizeHandle = target.closest('.resize-handle') !== null

    if (!isClip && !isResizeHandle) {
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

  const handleClipSelect = (clipIndex: number, ClipIndex: number) => {
    if (selectedClip && selectedClip.clipIndex === clipIndex && selectedClip.ClipIndex === ClipIndex) {
      setSelectedClip(null)
    } else setSelectedClip({ clipIndex, ClipIndex })
  }

  const handleResizeStart = (e: React.MouseEvent, mode: 'left' | 'right') => {
    e.stopPropagation()
    setResizeMode(mode)

    const MIN_DURATION_SECONDS = 0.5

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!selectedClip) return

      const clipIndex = selectedClip.clipIndex
      const ClipIndex = selectedClip.ClipIndex
      const currentClip = tracks[clipIndex].clips[ClipIndex]

      if (!currentClip) return

      const containerRect = timelineContainerRef.current?.getBoundingClientRect()
      if (!containerRect) return
      const scrollLeft = timelineContainerRef.current?.scrollLeft || 0
      const mouseX = moveEvent.clientX - containerRect.left + scrollLeft
      const trackRect = trackRefs.current[clipIndex]?.getBoundingClientRect() ?? null
      setResizeOverlay(
        getResizeOverlayRect({
          mode,
          currentClip,
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
        const originalEndFrame = currentClip.from + currentClip.durationInFrames
        const newStartFrame = Math.max(0, Math.round(newStartSeconds * FPS))
        const newDurationInFrames = originalEndFrame - newStartFrame

        // Check minimum duration constraint
        if (newDurationInFrames < MIN_DURATION_SECONDS * FPS) return

        // Check original duration constraint - only for video clips
        if (
          currentClip.type === 'video' &&
          currentClip.originalDuration &&
          newDurationInFrames > currentClip.originalDuration
        )
          return

        const updatedClips = [...tracks[clipIndex].clips]
        updatedClips[ClipIndex] = {
          ...currentClip,
          from: newStartFrame,
          durationInFrames: newDurationInFrames
        }

        handleTrackUpdate(clipIndex, updatedClips)
      } else {
        // Right resize - changes only duration
        const containerRect = timelineContainerRef.current?.getBoundingClientRect()
        if (!containerRect) return

        const scrollLeft = timelineContainerRef.current?.scrollLeft || 0
        const mouseX = moveEvent.clientX - containerRect.left + scrollLeft
        const ClipStartX = (currentClip.from / FPS) * pixelsPerSecond

        // We'll use the current clip's duration for calculations

        // Calculate the original duration in seconds if available - only for video clips
        const originalDurationSeconds =
          currentClip.type === 'video' && currentClip.originalDuration ? currentClip.originalDuration / FPS : undefined

        const newWidthPixels = calculateResizedWidth({
          mode: 'right',
          mouseX,
          ClipStartX,
          pixelsPerSecond,
          minDurationSeconds: MIN_DURATION_SECONDS,
          maxDurationSeconds: undefined, // Remove the restriction on max duration for trimming
          originalDurationSeconds // Pass the original duration to limit expansion
        })
        const newDurationSeconds = newWidthPixels / pixelsPerSecond

        if (newDurationSeconds < MIN_DURATION_SECONDS) return

        // We don't need to restrict the trim operation when reducing the clip size
        // The user should be able to trim the video to any smaller size

        const updatedClips = [...tracks[clipIndex].clips]
        updatedClips[ClipIndex] = {
          ...currentClip,
          durationInFrames: Math.round(newDurationSeconds * FPS)
        }

        handleTrackUpdate(clipIndex, updatedClips)
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
    handleClipSelect,
    handleResizeStart
  }
}
