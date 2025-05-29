import { FC, ReactNode, RefObject } from 'react'
import { Clip, Track } from '../../components/video-editor/types'

export interface VideoPlayerRef {
  play: () => void
  pause: () => void
  toggle: () => void
  seekTo: (frame: number) => void
  getContainerNode: () => HTMLDivElement | null
  getCurrentFrame: () => number
}

export interface VideoPlayerProps {
  ref?: RefObject<VideoPlayerRef | null>
  component: FC<any>
  fps: number
  inputProps: any
  durationInFrames: number
  compositionWidth: number
  compositionHeight: number
  style?: React.CSSProperties
  controls?: boolean
  autoPlay?: boolean
  loop?: boolean
  renderLoading?: () => ReactNode
}

export interface SequenceProps {
  from: number
  durationInFrames: number
  children: ReactNode
}

export interface AbsoluteFillProps {
  style?: React.CSSProperties
  children?: ReactNode
}

export interface VideoProps {
  src: string
  startFrom?: number
  style?: React.CSSProperties
  volume?: number
}

export interface AudioProps {
  src: string
  startFrom?: number
  volume?: number
}

export interface MediaParserResult {
  durationInMilliseconds: number
  width?: number
  height?: number
  fps?: number
}

export interface AudioData {
  channelWaveforms: Float32Array[]
  sampleRate: number
  durationInSeconds: number
}

export interface WaveformPortion {
  visualizationWidth: number
  startInVideo: number
  endInVideo: number
  data: number[]
}

export interface VideoRenderer {
  // Components
  Player: FC<VideoPlayerProps>
  Sequence: FC<SequenceProps>
  AbsoluteFill: FC<AbsoluteFillProps>
  Video: FC<VideoProps>
  Audio: FC<AudioProps>

  // Media utilities
  parseMedia: (file: File) => Promise<MediaParserResult>
  getAudioData: (src: string) => Promise<AudioData>
  getWaveformPortion: (params: {
    audioData: AudioData
    startTimeInSeconds: number
    endTimeInSeconds: number
    visualizationWidth: number
  }) => WaveformPortion

  // Configuration
  acknowledgeRemotionLicense?: boolean
}

export interface VideoRendererConfig {
  type: 'remotion' | 'html5' | 'konva' | 'custom'
  options?: Record<string, any>
}
