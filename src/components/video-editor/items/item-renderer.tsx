import { FC } from 'react'
import { AbsoluteFill, OffthreadVideo, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { Clip, VideoClip, CaptionClip } from '../types'
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
          objectFit: 'contain',
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
      const videoClip = clip as VideoClip

      if (clip.renderOption === 'contain-blur') {
        return (
          <AbsoluteFill>
            <VideoContainBlurBackground clip={clip} volume={volume} />
          </AbsoluteFill>
        )
      } else if (clip.renderOption === 'cover') {
        return (
          <AbsoluteFill>
            <VideoCover clip={clip} volume={volume} />
          </AbsoluteFill>
        )
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
    case 'caption':
      const captionClip = clip as CaptionClip
      const frame = useCurrentFrame()
      const { fps } = useVideoConfig()

      // For individual clips, frame starts at 0 for each clip
      // Calculate relative progress within this clip's duration
      const clipDurationFrames = captionClip.durationInFrames
      const relativeFrame = frame // frame is already relative to clip start
      const wordProgress = relativeFrame / clipDurationFrames

      // Spring animation for entrance (using relative frame)
      const entranceAnimation = spring({
        frame: relativeFrame,
        fps,
        config: {
          damping: 200,
          stiffness: 400,
          mass: 0.8
        }
      })

      // Scale animation (same as animated-captions)
      const scale = interpolate(entranceAnimation, [0, 1], [0.8, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      })

      // Opacity animation (using wordProgress based on relative timing)
      const opacity = interpolate(wordProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      })

      // Bounce animation (using relative frame)
      const bounce = interpolate(entranceAnimation, [0, 0.5, 1], [0, -5, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      })

      return (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }}
        >
          <div
            style={{
              fontSize: captionClip.fontSize || 56,
              fontWeight: captionClip.fontWeight || 900,
              color: captionClip.color || '#ffffff',
              textAlign: 'center',
              textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)',
              opacity,
              padding: '24px 48px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.02em',
              textTransform: 'uppercase' as const,
              maxWidth: '90%',
              position: 'absolute',
              bottom: captionClip.positionY !== undefined ? `${captionClip.positionY}px` : '80px',
              left: '50%',
              transform: `translateX(-50%) scale(${scale}) translateY(${bounce}px)`,
              whiteSpace: 'nowrap'
            }}
          >
            {captionClip.text}
          </div>
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
