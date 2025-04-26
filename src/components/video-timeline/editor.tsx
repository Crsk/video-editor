import React from 'react'
import { Player } from '@remotion/player'
import { EditorProvider, useEditor } from './context/editor-context'
import { MainComposition } from './composition/main-composition'
import { Timeline } from './timeline/timeline'
import { staticFile } from 'remotion'

const VideoPlayer: React.FC = () => {
  const { playerRef, tracks, durationInFrames, isLooping } = useEditor()
  const inputProps = { tracks }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 360,
        aspectRatio: '9 / 16',
        margin: '0 auto',
        background: '#111',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 16px #0002'
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

export const Editor: React.FC = () => {
  const initialTracks = [
    {
      name: 'Track 1',
      items: [
        {
          id: 'item-1',
          from: 0,
          durationInFrames: 1,
          type: 'video' as const,
          src: staticFile('manson_clone.mp4')
        }
      ]
    },
    {
      name: 'Track 2',
      items: [
        {
          id: 'item-2',
          from: 0,
          durationInFrames: 1,
          type: 'video' as const,
          src: staticFile('manson_clone.mp4')
        }
      ]
    },
    {
      name: 'Audio Track',
      items: [
        {
          id: 'audio-1',
          from: 0,
          durationInFrames: 1,
          type: 'audio' as const,
          src: staticFile('spectre.mp3')
        }
      ]
    }
  ]

  return (
    <EditorProvider initialTracks={initialTracks}>
      <div className="h-[200vh] pt-32">
        <VideoPlayer />
        <Timeline />
      </div>
    </EditorProvider>
  )
}
