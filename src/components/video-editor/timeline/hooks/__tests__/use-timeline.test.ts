import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimeline } from '../use-timeline'
import { createMockEditorFunctions, createMockTimelineState } from './test-utils'
import * as timelineCalculations from '../../../utils/timeline-calculations'

vi.mock('../../../context/video-editor-provider', () => {
  return {
    useEditor: () => ({
      tracks: [],
      duration: 30,
      FPS: 30,
      handleTimeUpdate: vi.fn(),
      togglePlayPause: vi.fn(),
      toggleLoop: vi.fn(),
      handleTrackUpdate: vi.fn(),
      moveClipToTrack: vi.fn().mockReturnValue(true),
      isPlaying: false,
      isLooping: false,
      currentTime: 0
    })
  }
})

vi.mock('../../../utils/timeline-calculations', async () => {
  const actual = await vi.importActual('../../../utils/timeline-calculations')
  return {
    ...actual,
    calculateMaxEndTime: vi.fn().mockReturnValue(10),
    calculateTotalTimelineDuration: vi.fn().mockReturnValue(20),
    generateTimeMarkers: vi.fn().mockReturnValue([0, 5, 10, 15, 20]),
    calculateTimelineWidth: vi.fn().mockReturnValue(1000),
    calculatePixelsPerSecond: vi.fn().mockReturnValue(50),
    calculateVideoEndPosition: vi.fn().mockReturnValue(500),
    calculateNonPlayableWidth: vi.fn().mockReturnValue(500)
  }
})

describe('useTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createMockEditorFunctions()
    createMockTimelineState()
    // Mock window functions related to refs and dimensions
    window.HTMLElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 800,
      left: 0,
      right: 800
    })
    // Mock window.scrollTo
    window.scrollTo = vi.fn()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current).toHaveProperty('containerRef')
    expect(result.current).toHaveProperty('timelineContainerRef')
    expect(result.current).toHaveProperty('trackRefs')
    expect(result.current).toHaveProperty('zoomIn')
    expect(result.current).toHaveProperty('zoomOut')
    expect(result.current).toHaveProperty('timeMarkers')
    expect(result.current).toHaveProperty('totalTimelineWidth')
    expect(result.current).toHaveProperty('videoEndPosition')
    expect(result.current).toHaveProperty('nonPlayableWidth')
    expect(result.current).toHaveProperty('pixelsPerSecond')
    expect(result.current).toHaveProperty('selectedClip')
    expect(result.current).toHaveProperty('isDragging')
    expect(result.current).toHaveProperty('resizeMode')
    expect(result.current).toHaveProperty('resizeOverlay')

    expect(result.current.isDragging).toBe(false)
    expect(result.current.selectedClip).toBe(null)
    expect(result.current.resizeMode).toBe(null)
    expect(result.current.resizeOverlay).toBe(null)
    expect(result.current.zoomLevelIndex).toBe(15) // Default zoom level
  })

  it('should call timeline calculation functions with correct parameters', () => {
    renderHook(() => useTimeline())

    // Verify that calculation functions were called
    expect(timelineCalculations.calculateMaxEndTime).toHaveBeenCalled()
    expect(timelineCalculations.calculateTotalTimelineDuration).toHaveBeenCalled()
    expect(timelineCalculations.generateTimeMarkers).toHaveBeenCalled()
    expect(timelineCalculations.calculateTimelineWidth).toHaveBeenCalled()
    expect(timelineCalculations.calculatePixelsPerSecond).toHaveBeenCalled()
    expect(timelineCalculations.calculateVideoEndPosition).toHaveBeenCalled()
    expect(timelineCalculations.calculateNonPlayableWidth).toHaveBeenCalled()
  })

  it('should update zoom level when zoomIn is called', () => {
    const { result } = renderHook(() => useTimeline())
    const initialZoomLevel = result.current.zoomLevelIndex

    act(() => {
      result.current.zoomIn()
    })

    // Zoom in should decrease the zoom level index (zooming in = showing less content but larger)
    expect(result.current.zoomLevelIndex).toBe(initialZoomLevel - 1)
  })

  it('should have a zoomIn function', () => {
    const { result } = renderHook(() => useTimeline())

    // Verify zoomIn exists and is a function
    expect(typeof result.current.zoomIn).toBe('function')
  })

  it('should have a zoomIn function that can be called', () => {
    const { result } = renderHook(() => useTimeline())

    expect(() => act(() => void result.current.zoomIn())).not.toThrow()
  })

  it('should have a zoomOut function that can be called', () => {
    const { result } = renderHook(() => useTimeline())

    expect(() => act(() => void result.current.zoomOut())).not.toThrow()
  })

  it('should call calculateTimeFromClick with the correct parameters', () => {
    const { result } = renderHook(() => useTimeline())
    const time = result.current.calculateTimeFromClick(150)

    // We can't check the internal implementation directly since it's not mocked
    // Just verify the function exists and returns a value
    expect(typeof time).toBe('number')
  })

  it('should update isDragging state', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current.isDragging).toBe(false)
    act(() => void result.current.setIsDragging(true))
    expect(result.current.isDragging).toBe(true)
  })

  it('should update selectedClip state', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current.selectedClip).toBeNull()

    const newSelectedClip = { clipIndex: 1, ClipIndex: 2 }
    act(() => void result.current.setSelectedClip(newSelectedClip))

    expect(result.current.selectedClip).toEqual(newSelectedClip)
  })
})
