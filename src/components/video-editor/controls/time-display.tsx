import { FC } from 'react'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'
import { useEditor } from '../context/video-editor-provider'
import { formatTimeDisplay } from '../utils/format-time'

export const TimeDisplay: FC = () => {
  const { currentTime, durationInFrames } = useEditor()
  const { timelineState } = useRemotionTimeline()
  const { FPS } = timelineState

  const durationInSeconds = durationInFrames / FPS

  return (
    <div className="flex items-center text-sm font-mono">
      <span className="text-muted-foreground">
        {formatTimeDisplay(currentTime)} / {formatTimeDisplay(durationInSeconds)}
      </span>
    </div>
  )
}
