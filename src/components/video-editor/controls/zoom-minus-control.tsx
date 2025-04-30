import { FC } from 'react'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'
import { Button } from '~/components/ui/button'

export const ZoomMinusControl: FC = () => {
  const { timelineState } = useRemotionTimeline()
  const { zoomOut, zoomLevelIndex } = timelineState
  const maxZoomLevel = 20 // This constant should ideally be in a shared config

  return (
    <Button variant="secondary" onClick={zoomOut} disabled={zoomLevelIndex === maxZoomLevel}>
      -
    </Button>
  )
}
