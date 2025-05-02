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
        .filter(track => track.items.length > 0)
        .map(track => ({
          name: track.name,
          volume: track.volume || 1,
          clips: track.items
            .filter(x => x.type === 'video' || x.type === 'audio')
            .map(item => ({
              id: item.id,
              type: item.type,
              from: item.from,
              durationInFrames: item.durationInFrames,
              src: item.src.split('/').pop()!,
              volume: item.volume || 1
            }))
        })),
      currentTime: currentTime
    }),
    [durationInFrames, timelineState.FPS, tracks, currentTime]
  )

  return compositionData
}
