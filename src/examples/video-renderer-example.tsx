import React, { useRef } from 'react'
import { VideoRendererProvider, useVideoRenderer } from '../lib/video-renderer/provider'
import { VideoPlayerRef } from '../lib/video-renderer/types'

// Example composition component
const ExampleComposition: React.FC<{ tracks: any[] }> = ({ tracks }) => {
  const { renderer } = useVideoRenderer()
  const { AbsoluteFill, Sequence, Video } = renderer

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={0} durationInFrames={300}>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px'
          }}
        >
          <h1>Hello Video Renderer!</h1>
        </AbsoluteFill>
      </Sequence>

      {/* Example video clip */}
      <Sequence from={60} durationInFrames={180}>
        <Video src="/example-video.mp4" style={{ width: '100%', height: '100%' }} volume={0.8} />
      </Sequence>
    </AbsoluteFill>
  )
}

// Example player component
const ExamplePlayer: React.FC = () => {
  const { renderer } = useVideoRenderer()
  const { Player } = renderer
  const playerRef = useRef<VideoPlayerRef>(null)

  const handlePlay = () => {
    playerRef.current?.play()
  }

  const handlePause = () => {
    playerRef.current?.pause()
  }

  const handleSeek = (frame: number) => {
    playerRef.current?.seekTo(frame)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Video Renderer Example</h2>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handlePlay} style={{ marginRight: '10px' }}>
          Play
        </button>
        <button onClick={handlePause} style={{ marginRight: '10px' }}>
          Pause
        </button>
        <button onClick={() => handleSeek(0)} style={{ marginRight: '10px' }}>
          Reset
        </button>
      </div>

      <div
        style={{
          width: '400px',
          height: '600px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <Player
          ref={playerRef}
          component={ExampleComposition}
          fps={30}
          inputProps={{ tracks: [] }}
          durationInFrames={300}
          compositionWidth={400}
          compositionHeight={600}
          controls={true}
          autoPlay={false}
          loop={true}
          renderLoading={() => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                background: '#f0f0f0'
              }}
            >
              Loading...
            </div>
          )}
        />
      </div>
    </div>
  )
}

// Example with different renderers
export const VideoRendererExample: React.FC = () => {
  const [rendererType, setRendererType] = React.useState<'html5' | 'remotion' | 'konva'>('html5')

  return (
    <div style={{ padding: '20px' }}>
      <h1>Video Renderer Abstraction Example</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>Choose Renderer: </label>
        <select
          value={rendererType}
          onChange={e => setRendererType(e.target.value as any)}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          <option value="html5">HTML5 Renderer</option>
          <option value="remotion">Remotion Renderer</option>
          <option value="konva">Konva Renderer (Demo)</option>
        </select>
      </div>

      <VideoRendererProvider config={{ type: rendererType }}>
        <ExamplePlayer />

        <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
          <h3>Current Renderer: {rendererType}</h3>
          <p>
            {rendererType === 'html5' && 'Using native HTML5 video elements. No external dependencies.'}
            {rendererType === 'remotion' && 'Using Remotion for advanced video processing. Requires Remotion license.'}
            {rendererType === 'konva' && 'Using Konva for canvas-based rendering. (Demo implementation)'}
          </p>
        </div>
      </VideoRendererProvider>
    </div>
  )
}

// Example showing media processing
export const MediaProcessingExample: React.FC = () => {
  const [mediaInfo, setMediaInfo] = React.useState<any>(null)
  const [audioData, setAudioData] = React.useState<any>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // This would work with any renderer
    const { renderer } = useVideoRenderer()

    try {
      const info = await renderer.parseMedia(file)
      setMediaInfo(info)

      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file)
        const audio = await renderer.getAudioData(url)
        setAudioData(audio)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to process media:', error)
    }
  }

  return (
    <VideoRendererProvider config={{ type: 'html5' }}>
      <div style={{ padding: '20px' }}>
        <h2>Media Processing Example</h2>

        <div style={{ marginBottom: '20px' }}>
          <input type="file" accept="video/*,audio/*" onChange={handleFileUpload} />
        </div>

        {mediaInfo && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
            <h3>Media Information:</h3>
            <pre>{JSON.stringify(mediaInfo, null, 2)}</pre>
          </div>
        )}

        {audioData && (
          <div style={{ padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
            <h3>Audio Data:</h3>
            <p>Sample Rate: {audioData.sampleRate}</p>
            <p>Duration: {audioData.durationInSeconds}s</p>
            <p>Channels: {audioData.channelWaveforms.length}</p>
          </div>
        )}
      </div>
    </VideoRendererProvider>
  )
}
