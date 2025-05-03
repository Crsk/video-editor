import { RefObject } from 'react'
import { vi, beforeAll, afterAll } from 'vitest'

export interface MockClip {
  id: string
  type: string
  from: number
  durationInFrames: number
}

export interface MockTrack {
  id: string
  clips: MockClip[]
}

export const createMockClip = (id: string, type = 'video', from = 0, durationInFrames = 30): MockClip => ({
  id,
  type,
  from,
  durationInFrames
})

export const createMockTrack = (id: string, clips: MockClip[] = []): MockTrack => ({
  id,
  clips
})

export const defaultTracks = [
  createMockTrack('track-1', [createMockClip('clip-1', 'video', 0, 30), createMockClip('clip-2', 'video', 60, 30)]),
  createMockTrack('track-2', [createMockClip('clip-3', 'audio', 30, 60)])
]

export const createMockEditorFunctions = () => ({
  handleTimeUpdate: vi.fn(),
  togglePlayPause: vi.fn(),
  toggleLoop: vi.fn(),
  handleTrackUpdate: vi.fn(),
  moveClipToTrack: vi.fn().mockReturnValue(true),
  tracks: defaultTracks,
  duration: 30,
  FPS: 30,
  isPlaying: false,
  isLooping: false,
  currentTime: 0
})

export const createMockRefs = () => {
  const containerRef = { current: document.createElement('div') } as RefObject<HTMLDivElement>
  const timelineContainerRef = { current: document.createElement('div') } as RefObject<HTMLDivElement>
  const trackRefs = { current: [] } as RefObject<(HTMLDivElement | null)[]>

  return { containerRef, timelineContainerRef, trackRefs }
}

export const mockResizeObserver = () => {
  const originalResizeObserver = window.ResizeObserver

  beforeAll(() => {
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
  })

  afterAll(() => {
    window.ResizeObserver = originalResizeObserver
  })
}

export const createMockTimelineState = () => {
  const refs = createMockRefs()

  return {
    ...refs,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    timeMarkers: [0, 5, 10, 15, 20],
    totalTimelineWidth: 1000,
    videoEndPosition: 500,
    nonPlayableWidth: 500,
    pixelsPerSecond: 50,
    selectedClip: null,
    isDragging: false,
    resizeMode: null,
    resizeOverlay: null,
    calculateTimeFromClick: vi.fn().mockReturnValue(5),
    zoomLevelIndex: 15,
    setSelectedClip: vi.fn(),
    setIsDragging: vi.fn(),
    setResizeMode: vi.fn(),
    setResizeOverlay: vi.fn(),
    activeClip: null,
    setActiveClip: vi.fn(),
    activeClipIndex: null,
    setActiveClipIndex: vi.fn(),
    originalVideoDurationInSeconds: 30,
    FPS: 30
  }
}
