import { FC } from 'react'
import { AbsoluteFill, Audio, staticFile } from 'remotion'
import { AudioItem as AudioItemType } from '../types'

interface AudioItemProps {
  item: AudioItemType
}

type VisualizationType = 'none'

interface AudioItemProps {
  item: AudioItemType
  visualizationType?: VisualizationType
  visualizationColor?: string
  visualizationHeight?: number
  visualizationBackground?: string
  volume?: number
}

export const AudioItem: FC<AudioItemProps> = ({
  item,
  visualizationType = 'waveform',
  visualizationHeight = 100,
  visualizationBackground = 'rgba(0, 0, 0, 0.5)',
  volume = 1
}) => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile(item.src)} volume={volume} />

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
