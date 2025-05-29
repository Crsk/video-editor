import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState } from 'react'
import {
  VideoRenderer,
  VideoPlayerProps,
  VideoPlayerRef,
  SequenceProps,
  AbsoluteFillProps,
  VideoProps,
  AudioProps,
  MediaParserResult,
  AudioData,
  WaveformPortion
} from '../types'

// HTML5 Player wrapper component
const HTML5PlayerWrapper = forwardRef<VideoPlayerRef, VideoPlayerProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const animationFrameRef = useRef<number>(0)

  useImperativeHandle(ref, () => ({
    play: () => {
      setIsPlaying(true)
      startAnimation()
    },
    pause: () => {
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    },
    toggle: () => {
      if (isPlaying) {
        setIsPlaying(false)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      } else {
        setIsPlaying(true)
        startAnimation()
      }
    },
    seekTo: (frame: number) => {
      setCurrentFrame(frame)
    },
    getContainerNode: () => containerRef.current,
    getCurrentFrame: () => currentFrame
  }))

  const startAnimation = () => {
    const animate = () => {
      setCurrentFrame(prev => {
        const next = prev + 1
        if (next >= props.durationInFrames) {
          if (props.loop) {
            return 0
          } else {
            setIsPlaying(false)
            return prev
          }
        }
        return next
      })

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }

  useEffect(() => {
    if (isPlaying) {
      startAnimation()
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying])

  const Component = props.component

  const playerControls = {
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    seekTo: (frame: number) => setCurrentFrame(frame)
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: props.compositionWidth,
        height: props.compositionHeight,
        position: 'relative',
        overflow: 'hidden',
        ...props.style
      }}
    >
      <Component {...props.inputProps} frame={currentFrame} />
      {props.controls && (
        <div
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '8px' }}
        >
          <button onClick={() => (isPlaying ? playerControls.pause() : playerControls.play())}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            min={0}
            max={props.durationInFrames}
            value={currentFrame}
            onChange={e => playerControls.seekTo(parseInt(e.target.value))}
            style={{ marginLeft: '8px', width: '200px' }}
          />
        </div>
      )}
    </div>
  )
})

HTML5PlayerWrapper.displayName = 'HTML5PlayerWrapper'

// Sequence wrapper - renders children only when frame is in range
const SequenceWrapper: React.FC<SequenceProps & { frame?: number }> = ({
  from,
  durationInFrames,
  children,
  frame = 0
}) => {
  const isVisible = frame >= from && frame < from + durationInFrames

  if (!isVisible) return null

  return <>{children}</>
}

// AbsoluteFill wrapper
const AbsoluteFillWrapper: React.FC<AbsoluteFillProps> = ({ style, children }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        ...style
      }}
    >
      {children}
    </div>
  )
}

// Video wrapper
const VideoWrapper: React.FC<VideoProps & { frame?: number }> = ({
  src,
  startFrom = 0,
  style,
  volume = 1,
  frame = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      const timeInSeconds = (startFrom + frame) / 30 // Assuming 30fps
      videoRef.current.currentTime = timeInSeconds
      videoRef.current.volume = volume
    }
  }, [frame, startFrom, volume])

  return (
    <video
      ref={videoRef}
      src={src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        ...style
      }}
      muted={volume === 0}
    />
  )
}

// Audio wrapper
const AudioWrapper: React.FC<AudioProps & { frame?: number }> = ({ src, startFrom = 0, volume = 1, frame = 0 }) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      const timeInSeconds = (startFrom + frame) / 30 // Assuming 30fps
      audioRef.current.currentTime = timeInSeconds
      audioRef.current.volume = volume
    }
  }, [frame, startFrom, volume])

  return <audio ref={audioRef} src={src} style={{ display: 'none' }} />
}

// Basic media parser using HTML5 APIs
const parseMediaWrapper = async (file: File): Promise<MediaParserResult> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)

    if (file.type.startsWith('video/')) {
      const video = document.createElement('video')
      video.onloadedmetadata = () => {
        resolve({
          durationInMilliseconds: video.duration * 1000,
          width: video.videoWidth,
          height: video.videoHeight,
          fps: 30 // Default fps, HTML5 doesn't provide this
        })
        URL.revokeObjectURL(url)
      }
      video.onerror = () => {
        reject(new Error('Failed to parse video'))
        URL.revokeObjectURL(url)
      }
      video.src = url
    } else if (file.type.startsWith('audio/')) {
      const audio = document.createElement('audio')
      audio.onloadedmetadata = () => {
        resolve({
          durationInMilliseconds: audio.duration * 1000
        })
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        reject(new Error('Failed to parse audio'))
        URL.revokeObjectURL(url)
      }
      audio.src = url
    } else {
      reject(new Error('Unsupported file type'))
      URL.revokeObjectURL(url)
    }
  })
}

// Basic audio data extraction (simplified)
const getAudioDataWrapper = async (src: string): Promise<AudioData> => {
  // This is a simplified implementation
  // In a real scenario, you'd use Web Audio API to analyze the audio
  return {
    channelWaveforms: [new Float32Array(1024)], // Placeholder
    sampleRate: 44100,
    durationInSeconds: 0
  }
}

// Basic waveform generation (simplified)
const getWaveformPortionWrapper = (params: {
  audioData: AudioData
  startTimeInSeconds: number
  endTimeInSeconds: number
  visualizationWidth: number
}): WaveformPortion => {
  // Generate simple waveform data
  const data = Array.from({ length: params.visualizationWidth }, (_, i) => Math.sin(i * 0.1) * 0.5 + 0.5)

  return {
    visualizationWidth: params.visualizationWidth,
    startInVideo: params.startTimeInSeconds,
    endInVideo: params.endTimeInSeconds,
    data
  }
}

export const html5Adapter: VideoRenderer = {
  Player: HTML5PlayerWrapper as any,
  Sequence: SequenceWrapper as any,
  AbsoluteFill: AbsoluteFillWrapper,
  Video: VideoWrapper as any,
  Audio: AudioWrapper as any,
  parseMedia: parseMediaWrapper,
  getAudioData: getAudioDataWrapper,
  getWaveformPortion: getWaveformPortionWrapper
}
