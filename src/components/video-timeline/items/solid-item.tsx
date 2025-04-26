import { FC } from 'react'
import { AbsoluteFill } from 'remotion'
import { SolidItem as SolidItemType } from '../types'

interface SolidItemProps {
  item: SolidItemType
}

export const SolidItem: FC<SolidItemProps> = ({ item }) => {
  return <AbsoluteFill style={{ backgroundColor: item.color }} />
}
