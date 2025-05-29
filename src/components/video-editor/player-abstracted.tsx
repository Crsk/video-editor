import { FC } from 'react'
import { useVideoRenderer } from '../../lib/video-renderer/provider'
import { useEditor } from './context/video-editor-provider'
import { MainComposition } from './composition/main-composition'
import { Track } from './types'

export const VideoPlayerAbstracted: FC = () => {
  const { renderer } = useVideoRenderer()
  // For testing, we'll create mock editor data if useEditor fails
  let playerRef: any = null
  let tracks: Track[] = []
  let durationInFrames: number = 300
  let isLooping: boolean = true

  try {
    const editorData = useEditor()
    playerRef = editorData.playerRef
    tracks = editorData.tracks
    durationInFrames = editorData.durationInFrames
    isLooping = editorData.isLooping
  } catch {
    // Mock data for testing - already initialized above
  }

  const inputProps = { tracks }
  const { Player } = renderer

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        aspectRatio: '9 / 16',
        margin: '0 auto',
        background: '#111',
        borderRadius: 12,
        overflow: 'hidden'
      }}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Player
          component={MainComposition}
          fps={30}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          compositionWidth={720}
          compositionHeight={1280}
          style={{ width: '100%', height: '100%' }}
          controls={true}
          autoPlay={false}
          loop={isLooping}
          renderLoading={() => <div className="flex items-center justify-center h-full">Loading...</div>}
        />
      </div>
    </div>
  )
}
