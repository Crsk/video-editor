import { FC } from 'react'
import { AbsoluteFill, OffthreadVideo } from 'remotion'
import { Item } from '../types'
import { AudioItem } from './audio-item'

interface ItemRendererProps {
  item: Item
  volume?: number
}

export const ItemRenderer: FC<ItemRendererProps> = ({ item, volume = 1 }) => {
  switch (item.type) {
    case 'video':
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
    case 'text':
      return (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: item.color || '#fff'
          }}
        >
          <h1>{item.text}</h1>
        </AbsoluteFill>
      )
    case 'solid':
      return <AbsoluteFill style={{ backgroundColor: item.color }} />
    case 'audio':
      return <AudioItem item={item} visualizationType="none" volume={item.volume || volume} />
    default:
      throw new Error(`Unknown item type: ${JSON.stringify(item)}`)
  }
}
