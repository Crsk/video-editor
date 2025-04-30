import { FC } from 'react'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'
import { Button } from '~/components/ui/button'

export const ZoomPlusControl: FC = () => {
  const { timelineState } = useRemotionTimeline()
  const { zoomIn, zoomLevelIndex } = timelineState

  return (
    <Button variant="secondary" onClick={zoomIn} disabled={zoomLevelIndex === 0}>
      +
    </Button>
  )
}
