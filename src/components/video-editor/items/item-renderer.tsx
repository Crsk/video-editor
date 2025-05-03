import { FC } from 'react'
import { AbsoluteFill, OffthreadVideo } from 'remotion'
import { Clip, VideoClip } from '../types'
import { AudioClip } from './audio-item'
import { useVideoTransform } from '../hooks/use-video-transform'

interface ClipRendererProps {
  clip: Clip
  volume?: number
}

const VideoContainBlurBackground = ({ clip, volume }: { clip: Clip; volume: number }) => {
  if (clip.type !== 'video') return null

  const { getVideoTransform } = useVideoTransform()
  const { transform, finalVolume } = getVideoTransform(clip as VideoClip, volume)

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo
        src={clip.src}
        startFrom={(clip as VideoClip).offset || 0}
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
        startFrom={(clip as VideoClip).offset || 0}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform // Apply zoom and position
        }}
        volume={finalVolume}
      />
    </AbsoluteFill>
  )
}

const VideoCover = ({ clip, volume }: { clip: Clip; volume: number }) => {
  if (clip.type !== 'video') return null

  const { getVideoTransform } = useVideoTransform()
  const { objectPosition, transform, finalVolume } = getVideoTransform(clip as VideoClip, volume)

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo
        src={clip.src}
        startFrom={(clip as VideoClip).offset || 0}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition,
          transform // Apply zoom with new scale
        }}
        volume={finalVolume}
      />
    </AbsoluteFill>
  )
}

export const ClipRenderer: FC<ClipRendererProps> = ({ clip, volume = 1 }) => {
  switch (clip.type) {
    case 'video':
      const { getVideoTransform } = useVideoTransform()
      const { transform, finalVolume } = getVideoTransform(clip as VideoClip, volume)

      if (clip.renderOption === 'contain-blur') {
        return <VideoContainBlurBackground clip={clip} volume={volume} />
      } else if (clip.renderOption === 'cover') {
        return <VideoCover clip={clip} volume={volume} />
      } else {
        return (
          <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <OffthreadVideo
              src={clip.src}
              startFrom={(clip as VideoClip).offset || 0}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform // Apply zoom and position
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
