import { FC } from 'react'
import { AbsoluteFill } from 'remotion'
import { TextClip as TextClipType } from '../types'

interface TextClipProps {
  clip: TextClipType
}

export const TextClip: FC<TextClipProps> = ({ clip }) => {
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
}
