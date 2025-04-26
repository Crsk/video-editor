import { FC } from 'react'
import { AbsoluteFill } from 'remotion'
import { TextItem as TextItemType } from '../types'

interface TextItemProps {
  item: TextItemType
}

export const TextItem: FC<TextItemProps> = ({ item }) => {
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: item.color || '#fff'
      }}
    >
      <h1>{item.text}</h1>
    </AbsoluteFill>
  )
}
