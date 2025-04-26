import { Button } from '../../ui/button'
import { PlayIcon } from '../icons/play-icon'
import { PauseIcon } from '../icons/pause-icon'
import { RepeatIcon } from 'lucide-react'
import { formatTimeDisplay } from '../utils/format-time'
import { FC } from 'react'
import { TimelineVolumeControl } from './timeline-volume-control'
import { useRemotionTimeline } from './context/remotion-timeline-context'

interface TimelineControlsProps {
  currentTime: number
  durationInSeconds: number
  isPlaying: boolean
  isLooping: boolean
  onPlayPause?: () => void
  onLoopToggle?: () => void
  zoomIn: () => void
  zoomOut: () => void
  zoomLevelIndex: number
  maxZoomLevel: number
}

export const TimelineControls: FC<TimelineControlsProps> = ({
  currentTime,
  durationInSeconds,
  isPlaying,
  isLooping,
  onPlayPause,
  onLoopToggle,
  zoomIn,
  zoomOut,
  zoomLevelIndex,
  maxZoomLevel
}) => {
  const { timelineState } = useRemotionTimeline()
  const { selectedItem } = timelineState

  return (
    <div className="flex justify-between mb-3">
      {/* Left Section (empty for now, could be used for additional controls) */}
      <div></div>

      {/* Center Section - Playback Controls */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center text-sm font-mono">
            <span className="text-muted-foreground">
              {formatTimeDisplay(currentTime)} / {formatTimeDisplay(durationInSeconds)}
            </span>
          </div>
        </div>

        {onPlayPause && (
          <Button variant="secondary" size="icon" onClick={onPlayPause} className="rounded-full">
            {isPlaying ? <PauseIcon className="text-primary" /> : <PlayIcon className="text-primary" />}
          </Button>
        )}

        {onLoopToggle && (
          <Button
            variant="secondary"
            size="icon"
            onClick={onLoopToggle}
            className="rounded-full"
            title={isLooping ? 'Loop enabled' : 'Loop disabled'}
          >
            {isLooping ? <RepeatIcon className="text-chart-2" /> : <RepeatIcon className="text-muted-foreground" />}
          </Button>
        )}
      </div>

      {/* Right Section - Zoom Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          {selectedItem?.itemIndex !== undefined && <TimelineVolumeControl />}
          <Button variant="secondary" onClick={zoomOut} disabled={zoomLevelIndex === maxZoomLevel}>
            -
          </Button>
          <Button variant="secondary" onClick={zoomIn} disabled={zoomLevelIndex === 0}>
            +
          </Button>
        </div>
      </div>
    </div>
  )
}
