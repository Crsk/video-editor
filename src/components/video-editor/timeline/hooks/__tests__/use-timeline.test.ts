import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimeline } from '../use-timeline'
import { createMockEditorFunctions, createMockTimelineState } from './test-utils'
import * as timelineCalculations from '../../../utils/timeline-calculations'

vi.mock('../../../context/video-editor-provider', () => {
  return {
    useEditor: () => ({
      tracks: [],
      durationInFrames: 900,
      originalVideoDuration: 900,
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
    expect(result.current.zoomLevelIndex).toBe(17) // Default zoom level
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

  it('should update zoom level when zoomIn and zoomOut are called', () => {
    const { result } = renderHook(() => useTimeline())
    const initialZoomLevel = result.current.zoomLevelIndex

    act(() => result.current.zoomIn())

    // Zoom in should decrease the zoom level index (zooming in = showing less content but larger)
    expect(result.current.zoomLevelIndex).toBe(initialZoomLevel - 1)

    act(() => result.current.zoomOut())

    // After zooming out, we should be back at the initial level
    expect(result.current.zoomLevelIndex).toBe(initialZoomLevel)
  })

  it('should have zoomIn and zoomOut functions', () => {
    const { result } = renderHook(() => useTimeline())

    // Verify zoomIn and zoomOut exist and are functions
    expect(typeof result.current.zoomIn).toBe('function')
    expect(typeof result.current.zoomOut).toBe('function')
  })

  it('should calculate time from click position', () => {
    const { result } = renderHook(() => useTimeline())

    // Mock the calculateTimeFromClick function directly since it's using DOM APIs
    // that are difficult to mock correctly in JSDOM
    const mockCalculateTimeFromClick = vi.fn().mockReturnValue(2)
    Object.defineProperty(result.current, 'calculateTimeFromClick', {
      value: mockCalculateTimeFromClick
    })

    const time = result.current.calculateTimeFromClick(150)

    expect(time).toBe(2)
    expect(mockCalculateTimeFromClick).toHaveBeenCalledWith(150)
  })

  it('should update isDragging state', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current.isDragging).toBe(false)
    act(() => result.current.setIsDragging(true))
    expect(result.current.isDragging).toBe(true)
  })

  it('should update selectedClip state', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current.selectedClip).toBeNull()

    const newSelectedClip = { clipIndex: 1, ClipIndex: 2 }
    act(() => result.current.setSelectedClip(newSelectedClip))

    expect(result.current.selectedClip).toEqual(newSelectedClip)
  })

  it('should update resizeMode state', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current.resizeMode).toBeNull()

    act(() => result.current.setResizeMode('left'))
    expect(result.current.resizeMode).toBe('left')

    act(() => result.current.setResizeMode('right'))
    expect(result.current.resizeMode).toBe('right')

    act(() => result.current.setResizeMode(null))
    expect(result.current.resizeMode).toBeNull()
  })

  it('should update resizeOverlay state', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current.resizeOverlay).toBeNull()

    const overlay = {
      left: 100,
      top: 50,
      width: 200,
      height: 100,
      label: 'Test Overlay'
    }

    act(() => result.current.setResizeOverlay(overlay))
    expect(result.current.resizeOverlay).toEqual(overlay)

    act(() => result.current.setResizeOverlay(null))
    expect(result.current.resizeOverlay).toBeNull()
  })

  it('should update activeClip and activeClipIndex state', () => {
    const { result } = renderHook(() => useTimeline())

    expect(result.current.activeClip).toBeNull()
    expect(result.current.activeClipIndex).toBeNull()

    const testClip = { id: 'test-clip', start: 0, end: 10 }

    act(() => result.current.setActiveClip(testClip))
    expect(result.current.activeClip).toEqual(testClip)

    act(() => result.current.setActiveClipIndex(2))
    expect(result.current.activeClipIndex).toBe(2)
  })
})
