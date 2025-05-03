import { FC } from 'react'
import { Player } from '@remotion/player'
import { useEditor } from './context/video-editor-provider'
import { MainComposition } from './composition/main-composition'

export const VideoPlayer: FC = () => {
  const { playerRef, tracks, durationInFrames, isLooping } = useEditor()
  const inputProps = { tracks }

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        aspectRatio: '9 / 16',
        margin: '0 auto',
        background: '#111',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--accent)'
      }}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Player
          ref={playerRef}
          component={MainComposition}
          fps={30}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          compositionWidth={720}
          compositionHeight={1280}
          style={{ width: '100%', height: '100%' }}
          acknowledgeRemotionLicense
          controls={false}
          autoPlay={false}
          loop={isLooping}
          renderLoading={() => <div className="flex items-center justify-center h-full">Loading...</div>}
        />
      </div>
    </div>
  )
}
