import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimelineInteractions } from '../use-timeline-interactions'
import { createMockTimelineState } from './test-utils'

vi.mock('../overlay-utils', () => ({
  getResizeOverlayRect: vi.fn().mockReturnValue({
    left: 100,
    top: 50,
    width: 200,
    height: 30,
    label: 'Test Overlay'
  })
}))

vi.mock('../calculate-resized-width', () => ({
  calculateResizedWidth: vi.fn().mockReturnValue(150)
}))

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

describe('useTimelineInteractions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with all expected handlers', () => {
    const timelineState = createMockTimelineState()
    const { result } = renderHook(() => useTimelineInteractions(timelineState))

    // Check that all handlers are returned
    expect(result.current).toHaveProperty('handleTimelineClick')
    expect(result.current).toHaveProperty('handleMarkerDrag')
    expect(result.current).toHaveProperty('handleClipSelect')
    expect(result.current).toHaveProperty('handleResizeStart')

    // Verify they are functions
    expect(typeof result.current.handleTimelineClick).toBe('function')
    expect(typeof result.current.handleMarkerDrag).toBe('function')
    expect(typeof result.current.handleClipSelect).toBe('function')
    expect(typeof result.current.handleResizeStart).toBe('function')
  })

  it('should call handleClipSelect to select a clip', () => {
    const timelineState = createMockTimelineState()
    const { result } = renderHook(() => useTimelineInteractions(timelineState))

    act(() => void result.current.handleClipSelect(1, 2))

    expect(timelineState.setSelectedClip).toHaveBeenCalledWith({ clipIndex: 1, ClipIndex: 2 })
  })

  it('should handle timeline click when not dragging', () => {
    const timelineState = createMockTimelineState()
    const { result } = renderHook(() => useTimelineInteractions(timelineState))
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 100,
      target: document.createElement('div')
    }

    mockEvent.target.closest = vi.fn().mockReturnValue(null)

    document.body.classList.add = vi.fn()
    document.body.classList.remove = vi.fn()

    const originalAddEventListener = document.addEventListener
    const originalRemoveEventListener = document.removeEventListener
    document.addEventListener = vi.fn()
    document.removeEventListener = vi.fn()

    try {
      act(() => void result.current.handleTimelineClick(mockEvent as any))

      // Verify the expected functions were called
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(timelineState.setSelectedClip).toHaveBeenCalledWith(null)
      expect(timelineState.setIsDragging).toHaveBeenCalledWith(true)
      expect(document.body.classList.add).toHaveBeenCalledWith('timeline-dragging')
      expect(timelineState.calculateTimeFromClick).toHaveBeenCalledWith(100)
      expect(document.addEventListener).toHaveBeenCalledTimes(2)
    } finally {
      // Restore original functions
      document.addEventListener = originalAddEventListener
      document.removeEventListener = originalRemoveEventListener
    }
  })

  it('should handle marker drag', () => {
    const timelineState = createMockTimelineState()
    const { result } = renderHook(() => useTimelineInteractions(timelineState))
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 100
    }

    document.body.classList.add = vi.fn()
    document.body.classList.remove = vi.fn()

    const originalAddEventListener = document.addEventListener
    const originalRemoveEventListener = document.removeEventListener
    document.addEventListener = vi.fn()
    document.removeEventListener = vi.fn()

    try {
      act(() => void result.current.handleMarkerDrag(mockEvent as any))

      // Verify the expected functions were called
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(timelineState.setIsDragging).toHaveBeenCalledWith(true)
      expect(document.body.classList.add).toHaveBeenCalledWith('timeline-dragging')
      expect(timelineState.calculateTimeFromClick).toHaveBeenCalledWith(100)
      expect(document.addEventListener).toHaveBeenCalledTimes(2)
    } finally {
      // Restore original functions
      document.addEventListener = originalAddEventListener
      document.removeEventListener = originalRemoveEventListener
    }
  })

  it('should handle resize start', () => {
    const timelineState = createMockTimelineState()
    timelineState.selectedClip = { clipIndex: 0, ClipIndex: 0 } as any
    const { result } = renderHook(() => useTimelineInteractions(timelineState))

    const mockEvent = {
      stopPropagation: vi.fn()
    }

    const originalAddEventListener = document.addEventListener
    const originalRemoveEventListener = document.removeEventListener
    document.addEventListener = vi.fn()
    document.removeEventListener = vi.fn()

    try {
      act(() => void result.current.handleResizeStart(mockEvent as any, 'left'))

      expect(mockEvent.stopPropagation).toHaveBeenCalled()
      expect(timelineState.setResizeMode).toHaveBeenCalledWith('left')
      expect(document.addEventListener).toHaveBeenCalledTimes(2)
    } finally {
      document.addEventListener = originalAddEventListener
      document.removeEventListener = originalRemoveEventListener
    }
  })
})
