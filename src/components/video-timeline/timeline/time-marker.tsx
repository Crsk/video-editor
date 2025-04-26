import { FC, MouseEvent } from 'react'

interface TimeMarkerProps {
  currentTime: number
  pixelsPerSecond: number
  isDragging: boolean
  onMarkerDrag?: (startEvent: MouseEvent) => void
}

export const TimeMarker: FC<TimeMarkerProps> = ({ currentTime, pixelsPerSecond, isDragging, onMarkerDrag }) => {
  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-timeline-accent z-30 group timeline-marker"
      style={{
        left: currentTime * pixelsPerSecond + 'px',
        height: '100%',
        transition: isDragging ? 'none' : 'left 0s',
        willChange: 'left'
      }}
      onMouseDown={onMarkerDrag}
    >
      <div className="time-marker-handle"></div>
    </div>
  )
}
