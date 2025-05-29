import { FC } from 'react'
import { useVideoRenderer } from '../../../lib/video-renderer/provider'
import { Track } from '../types'
import { TrackRendererAbstracted } from './track-renderer-abstracted'

interface MainCompositionAbstractedProps {
  tracks: Track[]
}

export const MainCompositionAbstracted: FC<MainCompositionAbstractedProps> = ({ tracks }) => {
  const { renderer } = useVideoRenderer()
  const { AbsoluteFill } = renderer

  return (
    <AbsoluteFill>
      {tracks.map(track => (
        <TrackRendererAbstracted track={track} key={track.name} />
      ))}
    </AbsoluteFill>
  )
}
