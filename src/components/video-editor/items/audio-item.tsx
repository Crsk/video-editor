import { FC } from 'react'
import { AbsoluteFill, Audio } from 'remotion'
import { AudioClip as AudioClipType } from '../types'

interface AudioClipProps {
  clip: AudioClipType
}

type VisualizationType = 'none'

interface AudioClipProps {
  clip: AudioClipType
  visualizationType?: VisualizationType
  visualizationColor?: string
  visualizationHeight?: number
  visualizationBackground?: string
  volume?: number
}

export const AudioClip: FC<AudioClipProps> = ({
  clip,
  visualizationType = 'waveform',
  visualizationHeight = 100,
  visualizationBackground = 'rgba(0, 0, 0, 0.5)',
  volume = 1
}) => {
  return (
    <AbsoluteFill>
      <Audio src={clip.src} volume={volume} />

      {visualizationType !== 'none' && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: visualizationHeight,
            backgroundColor: visualizationBackground
          }}
        ></div>
      )}
    </AbsoluteFill>
  )
}
