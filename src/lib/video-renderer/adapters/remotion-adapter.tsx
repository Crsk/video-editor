import React, { forwardRef } from 'react'
import { Player, PlayerRef } from '@remotion/player'
import {
  Sequence as RemotionSequence,
  AbsoluteFill as RemotionAbsoluteFill,
  OffthreadVideo,
  Audio as RemotionAudio
} from 'remotion'
import { parseMedia } from '@remotion/media-parser'
import {
  getAudioData as getRemotionAudioData,
  getWaveformPortion as getRemotionWaveformPortion
} from '@remotion/media-utils'
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

// Player wrapper component
const RemotionPlayerWrapper = forwardRef<VideoPlayerRef, VideoPlayerProps>((props, ref) => {
  const playerRef = React.useRef<PlayerRef>(null)

  React.useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.play(),
    pause: () => playerRef.current?.pause(),
    toggle: () => playerRef.current?.toggle(),
    seekTo: (frame: number) => playerRef.current?.seekTo(frame),
    getContainerNode: () => playerRef.current?.getContainerNode() || null,
    getCurrentFrame: () => playerRef.current?.getCurrentFrame() || 0
  }))

  const { ref: _, acknowledgeRemotionLicense, ...playerProps } = props as any

  return <Player ref={playerRef} {...playerProps} acknowledgeRemotionLicense />
})

RemotionPlayerWrapper.displayName = 'RemotionPlayerWrapper'

// Sequence wrapper
const SequenceWrapper: React.FC<SequenceProps> = ({ from, durationInFrames, children }) => {
  return (
    <RemotionSequence from={from} durationInFrames={durationInFrames}>
      {children}
    </RemotionSequence>
  )
}

// AbsoluteFill wrapper
const AbsoluteFillWrapper: React.FC<AbsoluteFillProps> = ({ style, children }) => {
  return <RemotionAbsoluteFill style={style}>{children}</RemotionAbsoluteFill>
}

// Video wrapper
const VideoWrapper: React.FC<VideoProps> = ({ src, startFrom = 0, style, volume = 1 }) => {
  return <OffthreadVideo src={src} startFrom={startFrom} style={style} volume={volume} />
}

// Audio wrapper
const AudioWrapper: React.FC<AudioProps> = ({ src, startFrom = 0, volume = 1 }) => {
  return <RemotionAudio src={src} startFrom={startFrom} volume={volume} />
}

// Media parser wrapper
const parseMediaWrapper = async (file: File): Promise<MediaParserResult> => {
  const result = await parseMedia({
    src: file,
    onParseProgress: () => {},
    acknowledgeRemotionLicense: true
  })

  return {
    durationInMilliseconds: result.durationInMilliseconds || 0,
    width: result.dimensions?.width,
    height: result.dimensions?.height,
    fps: result.fps
  }
}

// Audio data wrapper
const getAudioDataWrapper = async (src: string): Promise<AudioData> => {
  const data = await getRemotionAudioData(src)
  return {
    channelWaveforms: data.channelWaveforms,
    sampleRate: data.sampleRate,
    durationInSeconds: data.durationInSeconds
  }
}

// Waveform wrapper
const getWaveformPortionWrapper = (params: {
  audioData: AudioData
  startTimeInSeconds: number
  endTimeInSeconds: number
  visualizationWidth: number
}): WaveformPortion => {
  const portion = getRemotionWaveformPortion({
    audioData: params.audioData,
    startTimeInSeconds: params.startTimeInSeconds,
    endTimeInSeconds: params.endTimeInSeconds,
    numberOfSamples: params.visualizationWidth
  })

  return {
    visualizationWidth: params.visualizationWidth,
    startInVideo: params.startTimeInSeconds,
    endInVideo: params.endTimeInSeconds,
    data: portion
  }
}

export const remotionAdapter: VideoRenderer = {
  Player: RemotionPlayerWrapper as any,
  Sequence: SequenceWrapper,
  AbsoluteFill: AbsoluteFillWrapper,
  Video: VideoWrapper,
  Audio: AudioWrapper,
  parseMedia: parseMediaWrapper,
  getAudioData: getAudioDataWrapper,
  getWaveformPortion: getWaveformPortionWrapper,
  acknowledgeRemotionLicense: true
}
