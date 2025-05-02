import { FC } from 'react'
import { AbsoluteFill, OffthreadVideo } from 'remotion'
import { Item } from '../types'
import { AudioItem } from './audio-item'

interface ItemRendererProps {
  item: Item
  volume?: number
}

const VideoContainBlurBackground = ({ item, volume }: { item: Item; volume: number }) => {
  if (item.type !== 'video') return null

  const itemVolume = item.volume !== undefined ? item.volume : 1
  const finalVolume = volume * itemVolume

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo
        src={item.src}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: `blur(${100}px)`,
          transform: 'scale(3)'
        }}
        volume={0} // Background video has no sound
      />

      <OffthreadVideo
        src={item.src}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
        volume={finalVolume}
      />
    </AbsoluteFill>
  )
}

const VideoCover = ({ item, volume }: { item: Item; volume: number }) => {
  if (item.type !== 'video') return null

  // Default to center position (0,0) if not specified
  const positionX = item.positionX || 0
  const positionY = item.positionY || 0

  // Calculate the object-position based on the position values
  // Convert from -100/100 range to 0-100% range for CSS object-position
  const objectPositionX = `${50 + positionX / 2}%`
  const objectPositionY = `${50 + positionY / 2}%`

  const itemVolume = item.volume !== undefined ? item.volume : 1
  const finalVolume = volume * itemVolume

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
        volume={finalVolume}
      />
    </AbsoluteFill>
  )
}

export const ItemRenderer: FC<ItemRendererProps> = ({ item, volume = 1 }) => {
  switch (item.type) {
    case 'video':
      const itemVolume = item.volume !== undefined ? item.volume : 1
      const finalVolume = volume * itemVolume

      if (item.renderOption === 'contain-blur') {
        return <VideoContainBlurBackground item={item} volume={finalVolume} />
      } else if (item.renderOption === 'cover') {
        return <VideoCover item={item} volume={finalVolume} />
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
              volume={finalVolume}
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
