import { FC, MouseEvent } from 'react'
import { TimeMarkerStyle } from '../types'
import { cn } from '~/lib/utils'

interface TimeMarkerProps {
  currentTime: number
  pixelsPerSecond: number
  isDragging: boolean
  onMarkerDrag?: (startEvent: MouseEvent) => void
  styles?: TimeMarkerStyle
}

export const TimeMarker: FC<TimeMarkerProps> = ({ currentTime, pixelsPerSecond, isDragging, onMarkerDrag, styles }) => {
  return (
    <div
      className={cn('absolute top-0 bottom-0 w-0.5 bg-timeline-accent z-30 group timeline-marker', styles?.line)}
      style={{
        left: currentTime * pixelsPerSecond + 'px',
        height: '110%',
        transition: isDragging ? 'none' : 'left 0s',
        willChange: 'left'
      }}
      onMouseDown={onMarkerDrag}
    >
      <div className={cn('time-marker-handle', 'bg-[#0059ff]', styles?.handle)}></div>
    </div>
  )
}
