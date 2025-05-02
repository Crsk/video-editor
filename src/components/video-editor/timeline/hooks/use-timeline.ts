import { useState, useRef, useCallback, useEffect } from 'react'
import { useEditor } from '../../context/video-editor-provider'
import {
  calculateMaxEndTime,
  calculateTotalTimelineDuration,
  generateTimeMarkers,
  calculateTimelineWidth,
  calculatePixelsPerSecond,
  calculateVideoEndPosition,
  calculateNonPlayableWidth,
  ZoomLevel
} from '../../utils/timeline-calculations'

const FPS = 30
const ZOOM_LEVELS: ZoomLevel[] = [
  { secondsPerMarker: 1, markersOnScreen: 1.5, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 2, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 2.5, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 3, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 3.5, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 4.5, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 5.5, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 6.5, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 8.5, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 10.5, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 12.5, label: '' },
  { secondsPerMarker: 1, markersOnScreen: 14.5, label: '' },
  { secondsPerMarker: 2, markersOnScreen: 10, label: '' },
  { secondsPerMarker: 2, markersOnScreen: 12, label: '' },
  { secondsPerMarker: 2, markersOnScreen: 14, label: '' },
  { secondsPerMarker: 4, markersOnScreen: 10, label: '' },
  { secondsPerMarker: 4, markersOnScreen: 12, label: '' },
  { secondsPerMarker: 10, markersOnScreen: 7, label: '' },
  { secondsPerMarker: 10, markersOnScreen: 10, label: '' },
  { secondsPerMarker: 10, markersOnScreen: 13, label: '' }
]
const MINIMUM_TIMELINE_SECONDS = 10
// const MIN_DURATION_SECONDS = 0.5 TODO limit min duration

export interface TimelineState {
  containerRef: React.RefObject<HTMLDivElement | null>
  timelineContainerRef: React.RefObject<HTMLDivElement | null>
  trackRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
  zoomIn: () => void
  zoomOut: () => void
  timeMarkers: number[]
  totalTimelineWidth: number
  videoEndPosition: number
  nonPlayableWidth: number
  pixelsPerSecond: number
  selectedClip: { clipIndex: number; itemIndex: number } | null
  isDragging: boolean
  resizeMode: 'left' | 'right' | null
  resizeOverlay: {
    left: number
    top: number
    width: number
    height: number
    label: string
  } | null
  calculateTimeFromClick: (clientX: number) => number
  zoomLevelIndex: number
  setSelectedClip: (item: { clipIndex: number; itemIndex: number } | null) => void
  setIsDragging: (isDragging: boolean) => void
  setResizeMode: (mode: 'left' | 'right' | null) => void
  setResizeOverlay: (
    overlay: {
      left: number
      top: number
      width: number
      height: number
      label: string
    } | null
  ) => void
  activeItem: any | null
  setActiveItem: (item: any | null) => void
  activeItemClipIndex: number | null
  setActiveItemClipIndex: (index: number | null) => void
  activeItemIndex: number | null
  setActiveItemIndex: (index: number | null) => void
  originalVideoDurationInSeconds: number
  FPS: number
}

export const useTimeline = (): TimelineState => {
  const { tracks, durationInFrames, originalVideoDuration } = useEditor()

  const containerRef = useRef<HTMLDivElement>(null)
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const [zoomLevelIndex, setZoomLevelIndex] = useState(15)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedClip, setSelectedClip] = useState<{ clipIndex: number; itemIndex: number } | null>(null)
  const [resizeMode, setResizeMode] = useState<'left' | 'right' | null>(null)
  const [resizeOverlay, setResizeOverlay] = useState<{
    left: number
    top: number
    width: number
    height: number
    label: string
  } | null>(null)
  const trackRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeItem, setActiveItem] = useState<any | null>(null)
  const [activeItemClipIndex, setActiveItemClipIndex] = useState<number | null>(null)
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null)

  const durationInSeconds = durationInFrames / FPS
  const originalVideoDurationInSeconds = originalVideoDuration ? originalVideoDuration / FPS : Infinity

  // Global click listener to deselect the track when clicking outside
  useEffect(() => {
    if (selectedClip === null) return

    // Small delay to ensure this doesn't interfere with track selection
    const handleGlobalClick = (e: MouseEvent) => {
      const originalTarget = e.target as HTMLElement

      setTimeout(() => {
        const isClip = originalTarget.closest('.timeline-item') !== null
        const isResizeHandle = originalTarget.closest('.resize-handle') !== null
        const isTimelinePopover = originalTarget.closest('.timeline-popover') !== null

        if (!isClip && !isResizeHandle && !isTimelinePopover) setSelectedClip(null)
      }, 0)
    }

    document.addEventListener('mousedown', handleGlobalClick)

    return () => {
      document.removeEventListener('mousedown', handleGlobalClick)
    }
  }, [selectedClip])

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth)
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const currentZoomLevel = ZOOM_LEVELS[zoomLevelIndex]
  const pixelsPerSecond = calculatePixelsPerSecond(containerWidth, currentZoomLevel)
  const maxEndTimeVideoTracks = calculateMaxEndTime(tracks, 'video')
  const totalTimelineDuration = calculateTotalTimelineDuration(durationInSeconds, tracks, MINIMUM_TIMELINE_SECONDS)
  const secondsPerMarker = currentZoomLevel.secondsPerMarker
  const timeMarkers = generateTimeMarkers(totalTimelineDuration, secondsPerMarker, currentZoomLevel.markersOnScreen)
  const totalTimelineWidth = calculateTimelineWidth(timeMarkers, totalTimelineDuration, pixelsPerSecond, containerWidth)
  const videoEndPosition = calculateVideoEndPosition(maxEndTimeVideoTracks, pixelsPerSecond)
  const nonPlayableWidth = Math.max(
    calculateNonPlayableWidth(totalTimelineWidth, videoEndPosition),
    totalTimelineWidth - videoEndPosition
  )

  const calculateTimeFromClick = useCallback(
    (clientX: number) => {
      if (!timelineContainerRef.current) return 0

      const containerRect = timelineContainerRef.current.getBoundingClientRect()
      const scrollLeft = timelineContainerRef.current.scrollLeft

      return (clientX - containerRect.left + scrollLeft) / pixelsPerSecond
    },
    [timelineContainerRef, pixelsPerSecond]
  )

  const zoomIn = useCallback(() => {
    setZoomLevelIndex(prev => Math.max(0, prev - 1))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevelIndex(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1))
  }, [])

  return {
    containerRef,
    timelineContainerRef,
    trackRefs,
    zoomIn,
    zoomOut,
    timeMarkers,
    totalTimelineWidth,
    videoEndPosition,
    nonPlayableWidth,
    pixelsPerSecond,
    selectedClip,
    isDragging,
    resizeMode,
    resizeOverlay,
    calculateTimeFromClick,
    zoomLevelIndex,
    setSelectedClip,
    setIsDragging,
    setResizeMode,
    setResizeOverlay,
    activeItem,
    setActiveItem,
    activeItemClipIndex,
    setActiveItemClipIndex,
    activeItemIndex,
    setActiveItemIndex,
    originalVideoDurationInSeconds,
    FPS
  }
}
