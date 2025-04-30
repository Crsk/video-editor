import { Button } from '../../ui/button'
import { PlayIcon } from '../icons/play-icon'
import { PauseIcon } from '../icons/pause-icon'
import { RepeatIcon } from 'lucide-react'
import { formatTimeDisplay } from '../utils/format-time'
import { FC } from 'react'
import { TimelineVolumeControl } from './timeline-volume-control'
import { useRemotionTimeline } from './context/remotion-timeline-context'
import { useEditor } from '../context/editor-context'

export const TimelineControls: FC = () => {
  const { currentTime, isPlaying, isLooping, durationInFrames, togglePlayPause, toggleLoop } = useEditor()

  const { timelineState } = useRemotionTimeline()
  const { zoomIn, zoomOut, zoomLevelIndex, selectedItem, FPS } = timelineState

  const durationInSeconds = durationInFrames / FPS
  const maxZoomLevel = 20 // This constant should ideally be in a shared config

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

        <Button variant="secondary" size="icon" onClick={togglePlayPause} className="rounded-full">
          {isPlaying ? <PauseIcon className="text-primary" /> : <PlayIcon className="text-primary" />}
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={toggleLoop}
          className="rounded-full"
          title={isLooping ? 'Loop enabled' : 'Loop disabled'}
        >
          {isLooping ? <RepeatIcon className="text-chart-2" /> : <RepeatIcon className="text-muted-foreground" />}
        </Button>
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
