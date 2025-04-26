import { FC } from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { Track } from '../types'
import { ItemRenderer } from '../items/item-renderer'

interface TrackRendererProps {
  track: Track
}

export const TrackRenderer: FC<TrackRendererProps> = ({ track }) => {
  return (
    <AbsoluteFill>
      {track.items.map(item => (
        <Sequence key={item.id} from={item.from} durationInFrames={item.durationInFrames}>
          <ItemRenderer item={item} volume={track.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
