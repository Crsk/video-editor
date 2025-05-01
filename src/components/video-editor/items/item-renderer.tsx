import { FC } from 'react'
import { AbsoluteFill, OffthreadVideo } from 'remotion'
import { Item } from '../types'
import { AudioItem } from './audio-item'

interface ItemRendererProps {
  item: Item
  volume?: number
}

const VideoContainBlurBackground = ({ item }: { item: Item }) => {
  if (item.type !== 'video') return null

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo
        src={item.src}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: `blur(${25}px)`,
          transform: 'scale(10.05)'
        }}
      />

      <OffthreadVideo
        src={item.src}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </AbsoluteFill>
  )
}

const VideoCover = ({ item }: { item: Item }) => {
  if (item.type !== 'video') return null
  
  // Default to center position (0,0) if not specified
  const positionX = item.positionX || 0
  const positionY = item.positionY || 0
  
  // Calculate the object-position based on the position values
  // Convert from -100/100 range to 0-100% range for CSS object-position
  const objectPositionX = `${50 + positionX/2}%`
  const objectPositionY = `${50 + positionY/2}%`

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo
        src={item.src}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${objectPositionX} ${objectPositionY}`
        }}
      />
    </AbsoluteFill>
  )
}

export const ItemRenderer: FC<ItemRendererProps> = ({ item, volume = 1 }) => {
  switch (item.type) {
    case 'video':
      if (item.renderOption === 'contain-blur') {
        return <VideoContainBlurBackground item={item} />
      } else if (item.renderOption === 'cover') {
        return <VideoCover item={item} />
      } else {
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
