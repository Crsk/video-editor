import { FC } from 'react'
import { Track as TrackType } from '../types'
import { DotIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import { VideoIcon } from '../icons/video-icon'
import { MusicIcon } from '../icons/music-icon'
import { useTrackManager } from '~/components/video-editor/hooks/use-track-manager'

interface TrackSidePanelProps {
  tracks: TrackType[]
  className?: string
}

export const TrackSidePanel: FC<TrackSidePanelProps> = ({ tracks, className }) => {
  const { getTrackType } = useTrackManager()

  const renderTrackIcon = (trackIndex: number) => {
    const icons = {
      video: <VideoIcon />,
      audio: <MusicIcon />,
      generic: <DotIcon size={18} className="text-primary" />
    }

    return icons[getTrackType(trackIndex)]
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="h-[21px]"></div>

      <div className="mt-2">
        {tracks.map((_, index) => (
          <div key={`track-icon-${index}`} className="flex items-center justify-start h-8 mb-2 w-10">
            {renderTrackIcon(index)}
          </div>
        ))}
      </div>
    </div>
  )
}
