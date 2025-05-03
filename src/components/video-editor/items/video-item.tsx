import { FC } from 'react'
import { AbsoluteFill, OffthreadVideo } from 'remotion'
import { VideoClip as VideoClipType } from '../types'

interface VideoClipProps {
  clip: VideoClipType
}

export const VideoClip: FC<VideoClipProps> = ({ clip }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo
        src={clip.src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </AbsoluteFill>
  )
}
