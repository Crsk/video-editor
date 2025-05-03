import { FC } from 'react'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'
import { TimelineVolumeControl } from '../timeline/timeline-volume-control'

export const SelectedClipVolumeControl: FC = () => {
  const { timelineState } = useRemotionTimeline()
  const { selectedClip } = timelineState

  if (selectedClip?.ClipIndex === undefined) {
    return null
  }

  return <TimelineVolumeControl />
}
