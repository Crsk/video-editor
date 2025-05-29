import React, { useRef } from 'react'
import { VideoRendererProvider, useVideoRenderer } from './lib/video-renderer/provider'
import { VideoPlayerRef } from './lib/video-renderer/types'

// Simple test composition
function TestComposition({ tracks }: { tracks: any[] }) {
  const { renderer } = useVideoRenderer()
  const { AbsoluteFill, Sequence } = renderer

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      <Sequence from={0} durationInFrames={100}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1>HTML5 Renderer Test</h1>
            <p>✅ Working!</p>
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={100} durationInFrames={100}>
        <AbsoluteFill
          style={{
            background: 'linear-gradient(45deg, #a8e6cf, #ff8a80)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2>Frame-based Animation</h2>
            <p>No Remotion needed! 🎉</p>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}

// Test player
function TestPlayer() {
  const { renderer } = useVideoRenderer()
  const { Player } = renderer
  const playerRef = useRef<VideoPlayerRef | null>(null)

  return (
    <div style={{ padding: '20px' }}>
      <h1>HTML5 Video Renderer Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => playerRef.current?.play()}
          style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer' }}
        >
          ▶️ Play
        </button>
        <button
          onClick={() => playerRef.current?.pause()}
          style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer' }}
        >
          ⏸️ Pause
        </button>
        <button onClick={() => playerRef.current?.seekTo(0)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          ⏮️ Reset
        </button>
      </div>

      <div
        style={{
          width: '400px',
          height: '600px',
          border: '2px solid #ddd',
          borderRadius: '12px',
          overflow: 'hidden',
          margin: '20px 0'
        }}
      >
        <Player
          ref={playerRef}
          component={TestComposition}
          fps={30}
          inputProps={{ tracks: [] }}
          durationInFrames={200}
          compositionWidth={400}
          compositionHeight={600}
          controls={true}
          autoPlay={false}
          loop={true}
        />
      </div>

      <div
        style={{
          padding: '15px',
          background: '#e8f5e8',
          border: '1px solid #4caf50',
          borderRadius: '8px'
        }}
      >
        <h3>✅ HTML5 Renderer Active</h3>
        <p>
          <strong>Success!</strong> Your abstraction layer is working.
        </p>
        <p>This is running without any Remotion dependencies!</p>
      </div>
    </div>
  )
}

// Export the test app
export default function TestHTML5App() {
  return (
    <VideoRendererProvider config={{ type: 'html5' }}>
      <TestPlayer />
    </VideoRendererProvider>
  )
}
