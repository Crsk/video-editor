import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimelineDnd } from '../use-timeline-dnd'
import { createMockEditorFunctions, createMockTimelineState } from './test-utils'

vi.mock('../../find-gap-integration', () => ({
  getSnappedDropPosition: vi.fn()
}))

import { getSnappedDropPosition } from '../../find-gap-integration'

const mockHandleTrackUpdate = vi.fn()
const mockMoveClipToTrack = vi.fn().mockReturnValue(true)

vi.mock('../../../context/video-editor-provider', () => {
  return {
    useEditor: () => ({
      tracks: [
        {
          id: 'track-1',
          clips: [{ id: 'test-clip', type: 'video', from: 30, durationInFrames: 60 }]
        },
        {
          id: 'track-2',
          clips: []
        }
      ],
      duration: 30,
      FPS: 30,
      handleTimeUpdate: vi.fn(),
      togglePlayPause: vi.fn(),
      toggleLoop: vi.fn(),
      handleTrackUpdate: mockHandleTrackUpdate,
      moveClipToTrack: mockMoveClipToTrack,
      isPlaying: false,
      isLooping: false,
      currentTime: 0
    })
  }
})

vi.mock('../find-gap-integration', () => ({
  getSnappedDropPosition: vi.fn().mockReturnValue(45)
}))

describe('useTimelineDnd', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with all expected properties and handlers', () => {
    const editorFunctions = createMockEditorFunctions()
    editorFunctions.moveClipToTrack = vi.fn().mockReturnValue(true)
    editorFunctions.handleTrackUpdate = vi.fn()
    const timelineState = createMockTimelineState()
    const { result } = renderHook(() => useTimelineDnd(timelineState as any))

    // Check that all expected properties and handlers are returned
    expect(result.current).toHaveProperty('sensors')
    expect(result.current).toHaveProperty('handleDragStart')
    expect(result.current).toHaveProperty('handleDragMove')
    expect(result.current).toHaveProperty('handleDragEnd')
    expect(result.current).toHaveProperty('modifiers')
    expect(result.current).toHaveProperty('activeClip')

    // Verify they are the correct types
    expect(typeof result.current.handleDragStart).toBe('function')
    expect(typeof result.current.handleDragMove).toBe('function')
    expect(typeof result.current.handleDragEnd).toBe('function')
    expect(Array.isArray(result.current.modifiers)).toBe(true)
    expect(result.current.activeClip).toBeNull()
  })

  it('should handle drag start', () => {
    const timelineState = createMockTimelineState()
    const { result } = renderHook(() => useTimelineDnd(timelineState as any))
    const mockClip = { id: 'test-clip', type: 'video', from: 30, durationInFrames: 60 }
    const mockEvent = {
      active: {
        data: {
          current: {
            type: 'clip',
            clip: mockClip,
            clipIndex: 1,
            ClipIndex: 2
          }
        }
      }
    }

    act(() => {
      result.current.handleDragStart(mockEvent as any)
    })

    // Verify the expected functions were called with the correct parameters
    expect(timelineState.setActiveClip).toHaveBeenCalledWith(mockClip)
    expect(timelineState.setActiveClipIndex).toHaveBeenCalledWith(1)
    expect(timelineState.setActiveClipIndex).toHaveBeenCalledWith(2)
    expect(timelineState.setSelectedClip).toHaveBeenCalledWith({ clipIndex: 1, ClipIndex: 2 })
    expect(timelineState.setIsDragging).toHaveBeenCalledWith(true)
  })

  it('should handle drag move with auto-scrolling', () => {
    const mockContainer = document.createElement('div')
    mockContainer.scrollBy = vi.fn()
    const timelineState = {
      setIsDragging: vi.fn(),
      setSelectedClip: vi.fn(),
      setActiveClip: vi.fn(),
      activeClip: null,
      setActiveClipIndex: vi.fn(),
      activeClipIndex: null,
      timelineContainerRef: { current: mockContainer },
      pixelsPerSecond: 50,
      FPS: 30
    }

    const { result } = renderHook(() => useTimelineDnd(timelineState as any))

    mockContainer.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 100,
      right: 900
    })

    // Test left edge auto-scroll
    const leftEdgeEvent = {
      activatorEvent: {
        clientX: 120 // Just inside the left edge + scrollThreshold (assuming scrollThreshold = 50)
      }
    }

    act(() => {
      result.current.handleDragMove(leftEdgeEvent as any)
    })

    expect(mockContainer.scrollBy).toHaveBeenLastCalledWith({ left: -10, behavior: 'auto' })

    // Test right edge auto-scroll
    const rightEdgeEvent = {
      activatorEvent: {
        clientX: 880 // Just inside the right edge - scrollThreshold (assuming scrollThreshold = 50)
      }
    }

    act(() => {
      result.current.handleDragMove(rightEdgeEvent as any)
    })

    expect(mockContainer.scrollBy).toHaveBeenLastCalledWith({ left: 10, behavior: 'auto' })
  })

  it('should handle drag end for same track move', () => {
    mockHandleTrackUpdate.mockClear()
    mockMoveClipToTrack.mockClear()

    vi.mocked(getSnappedDropPosition).mockReturnValue(45)

    const timelineState = {
      ...createMockTimelineState(),
      activeClip: { id: 'test-clip', type: 'video', from: 30, durationInFrames: 60 },
      activeClipIndex: 0,
      pixelsPerSecond: 30,
      FPS: 30, // Important for the calculation in handleDragEnd
      isDragging: true,
      setActiveClip: vi.fn(),
      setActiveClipIndex: vi.fn(),
      setIsDragging: vi.fn()
    }

    const { result } = renderHook(() => useTimelineDnd(timelineState))

    // Create a mock drag end event - same track move
    const mockEvent = {
      active: {
        id: 'test-clip',
        data: {
          current: { type: 'clip' }
        }
      },
      delta: { x: 50, y: 0 },
      over: { id: 'clip-0' }
    }

    act(() => void result.current.handleDragEnd(mockEvent as any))

    // For same track, we should call handleTrackUpdate
    expect(mockHandleTrackUpdate).toHaveBeenCalledTimes(1)
    expect(mockMoveClipToTrack).not.toHaveBeenCalled()

    // Verify state is cleared
    expect(timelineState.setActiveClip).toHaveBeenCalledWith(null)
    expect(timelineState.setActiveClipIndex).toHaveBeenCalledWith(null)
    expect(timelineState.setActiveClipIndex).toHaveBeenCalledWith(null)
    expect(timelineState.setIsDragging).toHaveBeenCalledWith(false)
  })

  it('should handle drag end for cross-track move', () => {
    mockHandleTrackUpdate.mockClear()
    mockMoveClipToTrack.mockClear()

    const timelineState = {
      setIsDragging: vi.fn(),
      setSelectedClip: vi.fn(),
      setActiveClip: vi.fn(),
      activeClip: { id: 'clip-1', type: 'video', from: 30, durationInFrames: 60 },
      setActiveClipIndex: vi.fn(),
      activeClipIndex: 0,
      timelineContainerRef: { current: document.createElement('div') },
      pixelsPerSecond: 50,
      FPS: 30
    }

    const { result } = renderHook(() => useTimelineDnd(timelineState as any))

    // Create a mock drag end event - cross-track move
    const mockEvent = {
      active: {
        data: {
          current: {
            type: 'clip'
          }
        }
      },
      delta: { x: 200, y: 0 },
      over: { id: 'clip-1' } // Different track
    }

    act(() => void result.current.handleDragEnd(mockEvent as any))

    // For cross-track, we should call moveClipToTrack
    expect(mockMoveClipToTrack).toHaveBeenCalledTimes(1)
    expect(mockHandleTrackUpdate).not.toHaveBeenCalled()

    // Verify state is cleared
    expect(timelineState.setActiveClip).toHaveBeenCalledWith(null)
    expect(timelineState.setActiveClipIndex).toHaveBeenCalledWith(null)
    expect(timelineState.setActiveClipIndex).toHaveBeenCalledWith(null)
    expect(timelineState.setIsDragging).toHaveBeenCalledWith(false)
  })

  it('should apply modifier to snap to grid and lock to horizontal axis', () => {
    const timelineState = createMockTimelineState()
    const { result } = renderHook(() => useTimelineDnd(timelineState as any))
    const snapToGridModifier = result.current.modifiers[0]
    const transform = { x: 123, y: 45, scaleX: 1, scaleY: 1 }
    const mockArgs = {
      activatorEvent: null,
      active: { id: 'test-clip' } as any,
      activeNodeRect: null,
      draggingNodeRect: null,
      containerNodeRect: null,
      overlayNodeRect: null,
      scrollableAncestors: [],
      scrollableAncestorRects: [],
      windowRect: null,
      over: null,
      transform
    }
    const modifiedTransform = snapToGridModifier(mockArgs)

    // Should snap to grid (multiples of 15) and force y to 0
    expect(modifiedTransform.x).toBe(120) // Rounded to nearest 15
    expect(modifiedTransform.y).toBe(0) // Locked to horizontal
  })
})
