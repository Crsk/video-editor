import { FC } from 'react'
import { AbsoluteFill } from 'remotion'
import { Track } from '../types'
import { TrackRenderer } from './track-renderer'

interface MainCompositionProps {
  tracks: Track[]
}

export const MainComposition: FC<MainCompositionProps> = ({ tracks }) => {
  return (
    <AbsoluteFill>
      {tracks.map(track => (
        <TrackRenderer track={track} key={track.name} />
      ))}
    </AbsoluteFill>
  )
}
