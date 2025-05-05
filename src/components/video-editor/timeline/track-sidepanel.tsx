import { FC } from 'react'
import { Track as TrackType } from '../types'
import { DotIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import { VideoIcon } from '../icons/video-icon'
import { MusicIcon } from '../icons/music-icon'

interface TrackSidePanelProps {
  tracks: TrackType[]
  className?: string
}

export const TrackSidePanel: FC<TrackSidePanelProps> = ({ tracks, className }) => {
  const getTrackType = (track: TrackType) => {
    if (track.clips.some(clip => clip.type === 'video')) return 'video'
    if (track.clips.some(clip => clip.type === 'audio')) return 'audio'

    return 'generic'
  }

  const renderTrackIcon = (track: TrackType) => {
    const icons = {
      video: <VideoIcon />,
      audio: <MusicIcon />,
      generic: <DotIcon size={18} className="text-primary" />
    }

    return icons[getTrackType(track)]
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="h-[21px]"></div>

      <div className="mt-2">
        {tracks.map((track, index) => (
          <div key={`track-icon-${index}`} className="flex items-center justify-start h-8 mb-2 w-10">
            {renderTrackIcon(track)}
          </div>
        ))}
      </div>
    </div>
  )
}
