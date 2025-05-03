import { vi } from 'vitest'

export const createMockEditorFunctions = () => {
  return {
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
  }
}

export const createMockTimelineState = () => {
  return {
    containerRef: { current: document.createElement('div') },
    timelineContainerRef: { current: document.createElement('div') },
    trackRefs: { current: [] },
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
    zoomLevelIndex: 17,
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
