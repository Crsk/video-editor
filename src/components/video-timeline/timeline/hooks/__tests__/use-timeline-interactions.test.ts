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

vi.mock('../../../context/editor-context', () => {
  return {
    useEditor: () => ({
      tracks: [],
      duration: 30,
      FPS: 30,
      handleTimeUpdate: vi.fn(),
      togglePlayPause: vi.fn(),
      toggleLoop: vi.fn(),
      handleTrackUpdate: vi.fn(),
      moveItemToTrack: vi.fn().mockReturnValue(true),
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
    expect(result.current).toHaveProperty('handleItemSelect')
    expect(result.current).toHaveProperty('handleResizeStart')

    // Verify they are functions
    expect(typeof result.current.handleTimelineClick).toBe('function')
    expect(typeof result.current.handleMarkerDrag).toBe('function')
    expect(typeof result.current.handleItemSelect).toBe('function')
    expect(typeof result.current.handleResizeStart).toBe('function')
  })

  it('should call handleItemSelect to select a track item', () => {
    const timelineState = createMockTimelineState()
    const { result } = renderHook(() => useTimelineInteractions(timelineState))

    act(() => void result.current.handleItemSelect(1, 2))

    expect(timelineState.setSelectedItem).toHaveBeenCalledWith({ trackIndex: 1, itemIndex: 2 })
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
      expect(timelineState.setSelectedItem).toHaveBeenCalledWith(null)
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
    timelineState.selectedItem = { trackIndex: 0, itemIndex: 0 } as any
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
