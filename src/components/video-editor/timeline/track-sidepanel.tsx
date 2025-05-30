import { FC } from 'react'
import { Track as TrackType } from '../types'
import { DotIcon, Music2Icon, VideoIcon, CaptionsIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import { useTrackManager } from '~/components/video-editor/hooks/use-track-manager'

interface TrackSidePanelProps {
  tracks: TrackType[]
  className?: string
}

export const TrackSidePanel: FC<TrackSidePanelProps> = ({ tracks, className }) => {
  const { getTrackType } = useTrackManager()

  const renderTrackIcon = (trackIndex: number) => {
    const track = tracks[trackIndex]

    if (track?.type === 'caption' || track?.clips.some(clip => clip.type === 'caption'))
      return <CaptionsIcon size={14} className="text-primary" />

    const trackType = getTrackType(trackIndex)
    const icons: Record<string, React.ReactElement> = {
      video: <VideoIcon size={14} />,
      audio: <Music2Icon size={14} />,
      generic: <DotIcon size={18} className="text-primary" />
    }

    return icons[trackType] || icons.generic
  }

  return (
    <div className={cn('flex flex-col', className)} data-testid="track-sidepanel">
      <div className="h-[20px]"></div>

      <div className="mt-2" data-testid="track-icons-container">
        {tracks.map((_, index) => (
          <div
            key={`track-icon-${index}`}
            className="flex items-center justify-start h-8 mb-2 w-10"
            data-testid={`track-icon-${index}`}
          >
            {renderTrackIcon(index)}
          </div>
        ))}
      </div>
    </div>
  )
}
