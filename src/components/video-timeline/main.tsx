import type { Track, Item } from './types'
import React from 'react'
import { AbsoluteFill, Sequence, OffthreadVideo } from 'remotion'

const ItemComp: React.FC<{
  item: Item
}> = ({ item }) => {
  if (item.type === 'solid') {
    return <AbsoluteFill style={{ backgroundColor: item.color }} />
  }

  if (item.type === 'text') {
    return <h1>{item.text}</h1>
  }

  if (item.type === 'video') {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000' }}>
        <OffthreadVideo
          src={item.src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </AbsoluteFill>
    )
  }

  throw new Error(`Unknown item type: ${JSON.stringify(item)}`)
}

const Track: React.FC<{
  track: Track
}> = ({ track }) => {
  return (
    <AbsoluteFill>
      {track.items.map(item => {
        return (
          <Sequence key={item.id} from={item.from} durationInFrames={item.durationInFrames}>
            <ItemComp item={item} />
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}

export const Main: React.FC<{
  tracks: Track[]
  showPlayer?: boolean
}> = ({ tracks, showPlayer = true }) => {
  return (
    <AbsoluteFill>
      {tracks.map(track => {
        return <Track track={track} key={track.name} />
      })}
    </AbsoluteFill>
  )
}
