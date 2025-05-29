import { FC } from 'react'
import { useVideoRenderer } from '../../../lib/video-renderer/provider'
import { Clip, VideoClip } from '../types'
import { useVideoTransform } from '../hooks/use-video-transform'

interface ClipRendererAbstractedProps {
  clip: Clip
  volume?: number
}

export const ClipRendererAbstracted: FC<ClipRendererAbstractedProps> = ({ clip, volume = 1 }) => {
  const { renderer } = useVideoRenderer()
  const { AbsoluteFill, Video, Audio } = renderer

  switch (clip.type) {
    case 'video':
      const { getVideoTransform } = useVideoTransform()
      const { transform, finalVolume } = getVideoTransform(clip as VideoClip, volume)

      if (clip.renderOption === 'contain-blur') {
        return (
          <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <Video
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
            <Video
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
      } else if (clip.renderOption === 'cover') {
        const { objectPosition } = getVideoTransform(clip as VideoClip, volume)
        return (
          <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <Video
              src={clip.src}
              startFrom={(clip as VideoClip).offset || 0}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition,
                transform // Apply zoom with new scale
              }}
              volume={finalVolume}
            />
          </AbsoluteFill>
        )
      } else {
        return (
          <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <Video
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
      return <Audio src={clip.src} startFrom={0} volume={clip.volume || volume} />
    default:
      throw new Error(`Unknown clip type: ${JSON.stringify(clip)}`)
  }
}
