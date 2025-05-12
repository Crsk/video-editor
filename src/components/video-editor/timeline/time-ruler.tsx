import { FC } from 'react'
import { formatTimeCode } from '../utils/format-time'
import { cn } from '~/lib/utils'
import { TimeRulerStyle } from '../types'

interface TimeRulerProps {
  timeMarkers: number[]
  pixelsPerSecond: number
  videoEndPosition: number
  nonPlayableWidth: number
  hasVideoTracks: boolean
}

export const TimeRuler: FC<TimeRulerProps & { styles: TimeRulerStyle }> = ({
  timeMarkers,
  pixelsPerSecond,
  videoEndPosition,
  nonPlayableWidth,
  hasVideoTracks,
  styles
}) => {
  return (
    <div
      className={cn(
        'mb-2 text-muted-foreground text-xs cursor-pointer select-none bg-background/85 z-50',
        styles?.root
      )}
      data-testid="time-ruler"
      style={{ width: nonPlayableWidth + videoEndPosition }}
    >
      <div className="flex relative h-5">
        <div className="absolute inset-0 pointer-events-none">
          {/* Non-playable region */}
          {hasVideoTracks && (
            <div
              className="absolute top-0 bottom-0 bg-background/85 z-50"
              style={{
                left: videoEndPosition,
                width: nonPlayableWidth
              }}
            />
          )}
        </div>

        {/* Background grid lines - only between markers */}
        <div className="absolute inset-0 pointer-events-none">
          {timeMarkers.map((seconds, index) => {
            // Skip the last marker as there's no "between" after it
            if (index === timeMarkers.length - 1) return null

            const nextSeconds = timeMarkers[index + 1]
            const gap = nextSeconds - seconds
            const gridLines = []

            // Calculate how many grid lines to show based on pixel space between markers
            // The more pixels between markers (when zoomed in), the more grid lines we need
            const pixelGap = gap * pixelsPerSecond
            const numLines = pixelGap < 200 ? 1 : pixelGap < 300 ? 2 : pixelGap < 400 ? 3 : pixelGap < 500 ? 4 : 5

            for (let i = 1; i <= numLines; i++) {
              const position = seconds + (gap * i) / (numLines + 1)

              gridLines.push(
                <div
                  key={`grid-${seconds}-${i}`}
                  className={cn('absolute w-[1px] h-[25%] top-[37.5%] bg-primary/25', styles?.gridLines)}
                  style={{
                    left: position * pixelsPerSecond
                  }}
                />
              )
            }

            return gridLines
          })}
        </div>

        {timeMarkers.map(seconds => {
          const position = seconds * pixelsPerSecond

          return (
            <div
              key={seconds}
              className={cn(
                'absolute top-0 text-center -translate-x-1/2 whitespace-nowrap text-xs text-foreground/50',
                styles?.label
              )}
              style={{
                left: position,
                ...(seconds === 0 ? { marginLeft: '8px' } : {})
              }}
            >
              {formatTimeCode(seconds)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
