import { VideoRendererProvider } from './lib/video-renderer/provider'
import { VideoPlayerAbstracted } from './components/video-editor/player-abstracted'
import { MainCompositionAbstracted } from './components/video-editor/composition/main-composition-abstracted'
import { useRef } from 'react'
import { VideoPlayerRef } from './lib/video-renderer/types'

// Simple test composition for HTML5 renderer
function TestComposition({ tracks }: { tracks: any[] }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
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
        <h1>HTML5 Video Renderer</h1>
        <p>Working! 🎉</p>
        <p style={{ fontSize: '16px', marginTop: '20px' }}>Tracks: {tracks?.length || 0}</p>
      </div>
    </div>
  )
}

// Test player component
function TestPlayer() {
  const playerRef = useRef<VideoPlayerRef | null>(null)

  const handlePlay = () => {
    playerRef.current?.play()
  }

  const handlePause = () => {
    playerRef.current?.pause()
  }

  const handleReset = () => {
    playerRef.current?.seekTo(0)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Video Renderer Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handlePlay} style={{ marginRight: '10px', padding: '8px 16px' }}>
          ▶️ Play
        </button>
        <button onClick={handlePause} style={{ marginRight: '10px', padding: '8px 16px' }}>
          ⏸️ Pause
        </button>
        <button onClick={handleReset} style={{ padding: '8px 16px' }}>
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
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <VideoPlayerAbstracted />
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f0f8ff',
          borderRadius: '8px',
          border: '1px solid #b0d4ff'
        }}
      >
        <h3>✅ HTML5 Renderer Active</h3>
        <p>
          🎯 <strong>Success!</strong> You're now using the HTML5 video renderer instead of Remotion.
        </p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>No Remotion dependencies required</li>
          <li>Lightweight and fast</li>
          <li>Perfect for simple video playback</li>
        </ul>
      </div>
    </div>
  )
}

// Main App component with HTML5 renderer
function AppWithVideoRenderer() {
  return (
    <VideoRendererProvider config={{ type: 'html5' }}>
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <TestPlayer />
      </div>
    </VideoRendererProvider>
  )
}

export default AppWithVideoRenderer
