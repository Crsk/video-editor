import { FC, useEffect, useState } from 'react'
import { getAudioData, getWaveformPortion } from '@remotion/media-utils'

interface AudioTrackVisualizerProps {
  src: string
  color?: string
  height?: number
  barGap?: number
}

export const AudioTrackVisualizer: FC<AudioTrackVisualizerProps> = ({
  src,
  color = '#ffffff',
  height = 24,
  barGap = 1
}) => {
  const [waveform, setWaveform] = useState<number[] | null>(null)

  useEffect(() => {
    const loadAudioData = async () => {
      try {
        const audioData = await getAudioData(src)
        const samples = 1000
        const waveformData = getWaveformPortion({
          audioData,
          startTimeInSeconds: 0,
          durationInSeconds: audioData.durationInSeconds,
          numberOfSamples: samples
        })

        const amplitudes = waveformData.map(point => point.amplitude)
        setWaveform(amplitudes)
      } catch (error) {
        console.error('Error loading audio waveform for timeline:', error)
      }
    }

    loadAudioData()
  }, [src])

  if (!waveform) {
    return <div className="w-full" style={{ height }} />
  }

  return (
    <div className="relative h-full w-full flex items-center overflow-hidden" style={{ height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${waveform.length * (1 + barGap)} ${height}`}
        preserveAspectRatio="none"
      >
        {waveform.map((amplitude, i) => {
          const barHeight = amplitude * height * 2
          const y = (height - barHeight) / 2

          return <rect key={i} x={i * (1 + barGap)} y={y} width={1} height={barHeight} fill={color} rx={0.5} ry={0.5} />
        })}
      </svg>
    </div>
  )
}
