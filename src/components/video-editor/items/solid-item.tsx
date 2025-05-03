import { FC } from 'react'
import { AbsoluteFill } from 'remotion'
import { SolidClip as SolidClipType } from '../types'

interface SolidClipProps {
  clip: SolidClipType
}

export const SolidClip: FC<SolidClipProps> = ({ clip }) => {
  return <AbsoluteFill style={{ backgroundColor: clip.color }} />
}
