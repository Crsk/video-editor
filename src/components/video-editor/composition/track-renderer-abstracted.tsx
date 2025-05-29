import { FC } from 'react'
import { useVideoRenderer } from '../../../lib/video-renderer/provider'
import { Track } from '../types'
import { ClipRendererAbstracted } from '../items/item-renderer-abstracted'

interface TrackRendererAbstractedProps {
  track: Track
}

export const TrackRendererAbstracted: FC<TrackRendererAbstractedProps> = ({ track }) => {
  const { renderer } = useVideoRenderer()
  const { AbsoluteFill, Sequence } = renderer

  return (
    <AbsoluteFill>
      {track.clips.map(clip => (
        <Sequence key={clip.id} from={clip.from} durationInFrames={clip.durationInFrames}>
          <ClipRendererAbstracted clip={clip} volume={track.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
