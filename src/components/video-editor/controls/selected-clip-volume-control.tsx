import { FC } from 'react'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'
import { TimelineVolumeControl } from '../timeline/timeline-volume-control'

export const SelectedClipVolumeControl: FC = () => {
  const { timelineState } = useRemotionTimeline()
  const { selectedItem } = timelineState

  if (selectedItem?.itemIndex === undefined) {
    return null
  }

  return <TimelineVolumeControl />
}
