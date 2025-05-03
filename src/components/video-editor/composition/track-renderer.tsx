import { FC } from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { Track } from '../types'
import { ClipRenderer } from '../items/item-renderer'

interface TrackRendererProps {
  track: Track
}

export const TrackRenderer: FC<TrackRendererProps> = ({ track }) => {
  return (
    <AbsoluteFill>
      {track.clips.map(clip => (
        <Sequence key={clip.id} from={clip.from} durationInFrames={clip.durationInFrames}>
          <ClipRenderer clip={clip} volume={track.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
