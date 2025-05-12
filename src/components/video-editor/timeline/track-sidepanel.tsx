import { FC } from 'react'
import { Track as TrackType } from '../types'
import { DotIcon, Music2Icon, VideoIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import { useTrackManager } from '~/components/video-editor/hooks/use-track-manager'

interface TrackSidePanelProps {
  tracks: TrackType[]
  className?: string
}

export const TrackSidePanel: FC<TrackSidePanelProps> = ({ tracks, className }) => {
  const { getTrackType } = useTrackManager()

  const renderTrackIcon = (trackIndex: number) => {
    const icons = {
      video: <VideoIcon size={14} />,
      audio: <Music2Icon size={14} />,
      generic: <DotIcon size={18} className="text-primary" />
    }

    return icons[getTrackType(trackIndex)]
  }

  return (
    <div className={cn('flex flex-col', className)} data-testid="track-sidepanel">
      <div className="h-[20px]"></div>

      <div className="mt-2" data-testid="track-icons-container">
        {tracks.map((_, index) => (
          <div key={`track-icon-${index}`} className="flex items-center justify-start h-8 mb-2 w-10" data-testid={`track-icon-${index}`}>
            {renderTrackIcon(index)}
          </div>
        ))}
      </div>
    </div>
  )
}
