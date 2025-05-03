import { FC } from 'react'
import { AbsoluteFill, OffthreadVideo } from 'remotion'
import { Clip } from '../types'
import { AudioClip } from './audio-item'

interface ClipRendererProps {
  clip: Clip
  volume?: number
}

const VideoContainBlurBackground = ({ clip, volume }: { clip: Clip; volume: number }) => {
  if (clip.type !== 'video') return null

  const ClipVolume = clip.volume !== undefined ? clip.volume : 1
  const finalVolume = volume * ClipVolume

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo
        src={clip.src}
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
        src={clip.src}
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

const VideoCover = ({ clip, volume }: { clip: Clip; volume: number }) => {
  if (clip.type !== 'video') return null

  // Default to center position (0,0) if not specified
  const positionX = clip.positionX || 0
  const positionY = clip.positionY || 0

  // Calculate the object-position based on the position values
  // Convert from -100/100 range to 0-100% range for CSS object-position
  const objectPositionX = `${50 + positionX / 2}%`
  const objectPositionY = `${50 + positionY / 2}%`

  const ClipVolume = clip.volume !== undefined ? clip.volume : 1
  const finalVolume = volume * ClipVolume

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo
        src={clip.src}
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

export const ClipRenderer: FC<ClipRendererProps> = ({ clip, volume = 1 }) => {
  switch (clip.type) {
    case 'video':
      const ClipVolume = clip.volume !== undefined ? clip.volume : 1
      const finalVolume = volume * ClipVolume

      if (clip.renderOption === 'contain-blur') {
        return <VideoContainBlurBackground clip={clip} volume={finalVolume} />
      } else if (clip.renderOption === 'cover') {
        return <VideoCover clip={clip} volume={finalVolume} />
      } else {
        return (
          <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <OffthreadVideo
              src={clip.src}
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
            color: clip.color || '#fff'
          }}
        >
          <h1>{clip.text}</h1>
        </AbsoluteFill>
      )
    case 'solid':
      return <AbsoluteFill style={{ backgroundColor: clip.color }} />
    case 'audio':
      return <AudioClip clip={clip} visualizationType="none" volume={clip.volume || volume} />
    default:
      throw new Error(`Unknown clip type: ${JSON.stringify(clip)}`)
  }
}
