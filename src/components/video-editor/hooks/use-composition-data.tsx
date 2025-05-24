import { useMemo } from 'react'
import { useEditor } from '../context/video-editor-provider'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'
import { CompositionData } from '../types'

export function useCompositionData(): CompositionData {
  const { tracks, currentTime, durationInFrames } = useEditor()
  const { timelineState } = useRemotionTimeline()

  const compositionData = useMemo(
    () => ({
      composition: {
        durationInFrames,
        fps: timelineState.FPS
      },
      tracks: tracks
        .filter(track => track.clips.length > 0)
        .map(track => ({
          name: track.name,
          volume: track.volume || 1,
          clips: track.clips
            .filter(x => x.type === 'video' || x.type === 'audio')
            .map(clip => ({
              id: clip.id,
              type: clip.type,
              from: clip.from,
              durationInFrames: clip.durationInFrames,
              src: clip.src.split('/').pop()!,
              volume: clip.volume || 1,
              url: clip.url
            }))
        })),
      currentTime: currentTime
    }),
    [durationInFrames, timelineState.FPS, tracks, currentTime]
  )

  return compositionData
}
