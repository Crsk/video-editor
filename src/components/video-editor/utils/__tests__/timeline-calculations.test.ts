import { describe, it, expect } from 'vitest'
import {
  calculateMaxEndTime,
  calculateTotalTimelineDuration,
  generateTimeMarkers,
  calculateTimelineWidth,
  calculatePixelsPerSecond,
  calculateTimeFromClick,
  calculateVideoEndPosition,
  calculateNonPlayableWidth,
  ZoomLevel
} from '../timeline-calculations'
import { Track } from '../../types'

describe('Timeline Calculations', () => {
  const mockTracks: Track[] = [
    {
      name: 'Video Track',
      clips: [
        {
          id: 'video-1',
          from: 0,
          durationInFrames: 300, // 10 seconds at 30fps
          type: 'video',
          src: '/test-video.mp4',
          url: '/test-video.mp4'
        },
        {
          id: 'video-2',
          from: 450, // 15 seconds at 30fps
          durationInFrames: 150, // 5 seconds at 30fps
          type: 'video',
          src: '/test-video2.mp4',
          url: '/test-video2.mp4'
        }
      ]
    },
    {
      name: 'Audio Track',
      clips: [
        {
          id: 'audio-1',
          from: 0,
          durationInFrames: 900, // 30 seconds at 30fps
          type: 'audio',
          src: '/test-audio.mp3',
          url: '/test-audio.mp3'
        }
      ]
    }
  ]

  describe('calculateMaxEndTime', () => {
    it('should calculate the maximum end time across all tracks', () => {
      const result = calculateMaxEndTime(mockTracks)
      // Audio track ends at 30 seconds (900 frames)
      expect(result).toBe(30)
    })

    it('should calculate the maximum end time for video tracks only', () => {
      const result = calculateMaxEndTime(mockTracks, 'video')
      // Video-2 ends at 20 seconds (450 + 150 = 600 frames)
      expect(result).toBe(20)
    })

    it('should return 0 for empty tracks', () => {
      const result = calculateMaxEndTime([])
      expect(result).toBe(0)
    })
  })

  describe('calculateTotalTimelineDuration', () => {
    it('should use the maximum of all durations', () => {
      const result = calculateTotalTimelineDuration(20, mockTracks, 5)
      // Audio track is 30 seconds, which is max
      expect(result).toBe(30)
    })

    it('should respect minimum duration', () => {
      const shortTracks: Track[] = [
        {
          name: 'Short Track',
          clips: [
            {
              id: 'short-1',
              from: 0,
              durationInFrames: 30, // 1 second at 30fps
              type: 'video',
              src: '/short.mp4',
              url: '/short.mp4'
            }
          ]
        }
      ]
      const result = calculateTotalTimelineDuration(1, shortTracks, 15)
      // Minimum duration is 15 seconds
      expect(result).toBe(15)
    })
  })

  describe('generateTimeMarkers', () => {
    it('should generate correct number of markers', () => {
      const result = generateTimeMarkers(30, 5, 3)
      // 30 seconds with 5 seconds per marker = 7 markers (including 0)
      expect(result.length).toBeGreaterThanOrEqual(7)
    })

    it('should generate markers at correct intervals', () => {
      const result = generateTimeMarkers(10, 2, 3)
      expect(result[0]).toBe(0)
      expect(result[1]).toBe(2)
      expect(result[2]).toBe(4)
      expect(result[3]).toBe(6)
      expect(result[4]).toBe(8)
      expect(result[5]).toBe(10)
    })

    it('should generate enough markers for visible area', () => {
      const result = generateTimeMarkers(5, 1, 10)
      // Should generate at least 10 * 2 = 20 markers for visible area
      expect(result.length).toBeGreaterThanOrEqual(20)
    })
  })

  describe('calculateTimelineWidth', () => {
    it('should calculate width based on markers', () => {
      const markers = [0, 5, 10, 15, 20, 25, 30]
      const result = calculateTimelineWidth(markers, 30, 10, 200)
      // Last marker (30) * pixelsPerSecond (10) = 300
      expect(result).toBe(300)
    })

    it('should use container width if larger', () => {
      const markers = [0, 5, 10]
      const result = calculateTimelineWidth(markers, 10, 10, 500)
      // Container width (500) > Last marker (10) * pixelsPerSecond (10) = 100
      expect(result).toBe(500)
    })

    it('should use total duration if no markers', () => {
      const markers: number[] = []
      const result = calculateTimelineWidth(markers, 20, 15, 200)
      // Total duration (20) * pixelsPerSecond (15) = 300
      expect(result).toBe(300)
    })
  })

  describe('calculatePixelsPerSecond', () => {
    it('should calculate pixels per second based on zoom level', () => {
      const zoomLevel: ZoomLevel = {
        secondsPerMarker: 5,
        markersOnScreen: 4,
        label: ''
      }
      const containerWidth = 1000
      const result = calculatePixelsPerSecond(containerWidth, zoomLevel)
      // containerWidth / (secondsPerMarker * markersOnScreen) = 1000 / (5 * 4) = 50
      expect(result).toBe(50)
    })

    it('should handle small container widths', () => {
      const zoomLevel: ZoomLevel = {
        secondsPerMarker: 1,
        markersOnScreen: 2,
        label: ''
      }
      const containerWidth = 200
      const result = calculatePixelsPerSecond(containerWidth, zoomLevel)
      // containerWidth / (secondsPerMarker * markersOnScreen) = 200 / (1 * 2) = 100
      expect(result).toBe(100)
    })
  })

  describe('calculateTimeFromClick', () => {
    it('should calculate time from click position', () => {
      const clientX = 250
      const containerRect = {
        left: 50,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {}
      } as DOMRect
      const scrollLeft = 100
      const pixelsPerSecond = 50
      const maxDuration = 30

      const result = calculateTimeFromClick(clientX, containerRect, scrollLeft, pixelsPerSecond, maxDuration)
      // (clientX - containerRect.left + scrollLeft) / pixelsPerSecond = (250 - 50 + 100) / 50 = 6
      expect(result).toBe(6)
    })

    it('should clamp time to 0 if negative', () => {
      const clientX = 10
      const containerRect = {
        left: 100,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {}
      } as DOMRect
      const scrollLeft = 0
      const pixelsPerSecond = 50
      const maxDuration = 30

      const result = calculateTimeFromClick(clientX, containerRect, scrollLeft, pixelsPerSecond, maxDuration)
      // Should clamp to 0 since (10 - 100 + 0) / 50 = -1.8
      expect(result).toBe(0)
    })

    it('should clamp time to max duration if larger', () => {
      const clientX = 2000
      const containerRect = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {}
      } as DOMRect
      const scrollLeft = 0
      const pixelsPerSecond = 50
      const maxDuration = 30

      const result = calculateTimeFromClick(clientX, containerRect, scrollLeft, pixelsPerSecond, maxDuration)
      // Should clamp to 30 since (2000 - 0 + 0) / 50 = 40 > 30
      expect(result).toBe(30)
    })
  })

  describe('calculateVideoEndPosition', () => {
    it('should calculate video end position', () => {
      const maxEndTimeVideoTracks = 20
      const pixelsPerSecond = 30
      const result = calculateVideoEndPosition(maxEndTimeVideoTracks, pixelsPerSecond)
      // maxEndTimeVideoTracks * pixelsPerSecond = 20 * 30 = 600
      expect(result).toBe(600)
    })

    it('should handle zero end time', () => {
      const maxEndTimeVideoTracks = 0
      const pixelsPerSecond = 30
      const result = calculateVideoEndPosition(maxEndTimeVideoTracks, pixelsPerSecond)
      expect(result).toBe(0)
    })
  })

  describe('calculateNonPlayableWidth', () => {
    it('should calculate non-playable width', () => {
      const totalTimelineWidth = 1000
      const videoEndPosition = 600
      const result = calculateNonPlayableWidth(totalTimelineWidth, videoEndPosition)
      // totalTimelineWidth - videoEndPosition = 1000 - 600 = 400
      expect(result).toBe(400)
    })

    it('should handle zero video end position', () => {
      const totalTimelineWidth = 500
      const videoEndPosition = 0
      const result = calculateNonPlayableWidth(totalTimelineWidth, videoEndPosition)
      expect(result).toBe(500)
    })

    it('should handle equal values', () => {
      const totalTimelineWidth = 800
      const videoEndPosition = 800
      const result = calculateNonPlayableWidth(totalTimelineWidth, videoEndPosition)
      expect(result).toBe(0)
    })
  })
})
