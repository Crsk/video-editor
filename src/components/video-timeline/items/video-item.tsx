import { FC } from 'react'
import { AbsoluteFill, OffthreadVideo } from 'remotion'
import { VideoItem as VideoItemType } from '../types'

interface VideoItemProps {
  item: VideoItemType
}

export const VideoItem: FC<VideoItemProps> = ({ item }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo
        src={item.src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </AbsoluteFill>
  )
}
