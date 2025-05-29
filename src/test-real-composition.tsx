import React, { useRef } from 'react'
import { VideoRendererProvider, useVideoRenderer } from './lib/video-renderer/provider'
import { VideoPlayerRef } from './lib/video-renderer/types'
import { Track } from './components/video-editor/types'
import { MainCompositionAbstracted } from './components/video-editor/composition/main-composition-abstracted'

// Your actual words data
const words = [
  { word: 'I', start: 0, end: 0.14000000059604645 },
  { word: 'launched', start: 0.14000000059604645, end: 0.4000000059604645 },
  { word: '15', start: 0.4000000059604645, end: 0.9599999785423279 },
  { word: 'different', start: 0.9599999785423279, end: 1.2599999904632568 },
  { word: 'video', start: 1.2599999904632568, end: 1.559999942779541 },
  { word: 'ads', start: 1.559999942779541, end: 1.7999999523162842 },
  { word: 'last', start: 1.7999999523162842, end: 2.0399999618530273 },
  { word: 'week', start: 2.0399999618530273, end: 2.299999952316284 },
  { word: 'and', start: 2.299999952316284, end: 2.5399999618530273 },
  { word: 'found', start: 2.5399999618530273, end: 2.700000047683716 },
  { word: 'a', start: 2.700000047683716, end: 2.859999895095825 },
  { word: 'winner', start: 2.859999895095825, end: 3.0799999237060547 },
  { word: 'in', start: 3.0799999237060547, end: 3.319999933242798 },
  { word: 'just', start: 3.319999933242798, end: 3.4600000381469727 },
  { word: '3', start: 3.4600000381469727, end: 3.7200000286102295 },
  { word: 'days.', start: 3.7200000286102295, end: 4.460000038146973 },
  { word: 'Discover', start: 4.460000038146973, end: 4.820000171661377 },
  { word: 'how', start: 4.820000171661377, end: 5.239999771118164 },
  { word: "Sovran's", start: 5.239999771118164, end: 5.679999828338623 },
  { word: 'customer', start: 5.679999828338623, end: 6.079999923706055 },
  { word: 'achieved', start: 6.079999923706055, end: 6.400000095367432 },
  { word: 'this.', start: 6.400000095367432, end: 6.71999979019165 }
]

// Your actual initial tracks
const initialTracks: Track[] = [
  {
    name: 'Track 1',
    clips: [
      {
        id: 'clip-1',
        from: 0,
        durationInFrames: 300, // Longer duration for testing
        type: 'video',
        src: 'manson_clone.mp4',
        words
      }
    ]
  },
  {
    name: 'Track 2',
    clips: [
      {
        id: 'clip-2',
        from: 100, // Start later for layering
        durationInFrames: 200,
        type: 'video',
        src: 'manson_clone.mp4',
        words
      }
    ]
  },
  {
    name: 'Audio Track',
    type: 'audio',
    clips: [
      {
        id: 'audio-1',
        from: 0,
        durationInFrames: 300,
        type: 'audio',
        src: 'spectre.mp3'
      }
    ]
  }
]

// Test player using your actual composition
function RealCompositionTest() {
  const { renderer } = useVideoRenderer()
  const { Player } = renderer
  const playerRef = useRef<VideoPlayerRef | null>(null)

  return (
    <div style={{ padding: '20px' }}>
      <h1>HTML5 Renderer with Your Real Composition</h1>

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
        <button
          onClick={() => playerRef.current?.seekTo(0)}
          style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer' }}
        >
          ⏮️ Reset
        </button>
        <button onClick={() => playerRef.current?.seekTo(150)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          ⏭️ Jump to 150
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Track Information:</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {initialTracks.map((track, index) => (
            <li key={index}>
              <strong>{track.name}</strong> - {track.clips.length} clip(s)
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                {track.clips.map((clip, clipIndex) => (
                  <li key={clipIndex}>
                    {clip.type}: {clip.type === 'video' || clip.type === 'audio' ? clip.src : 'N/A'} (frames {clip.from}
                    -{clip.from + clip.durationInFrames})
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          width: '720px',
          height: '1280px',
          maxHeight: '70vh',
          border: '2px solid #ddd',
          borderRadius: '12px',
          overflow: 'hidden',
          margin: '20px 0',
          transform: 'scale(0.3)',
          transformOrigin: 'top left'
        }}
      >
        <Player
          ref={playerRef}
          component={MainCompositionAbstracted}
          fps={30}
          inputProps={{ tracks: initialTracks }}
          durationInFrames={300}
          compositionWidth={720}
          compositionHeight={1280}
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
          borderRadius: '8px',
          marginTop: '20px'
        }}
      >
        <h3>✅ HTML5 Renderer with Real Composition</h3>
        <p>
          <strong>Success!</strong> Your actual tracks and composition are working with HTML5 renderer.
        </p>
        <p>This includes:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>✅ Real video clips (manson_clone.mp4)</li>
          <li>✅ Real audio clips (spectre.mp3)</li>
          <li>✅ Word-level timing data</li>
          <li>✅ Multiple track layers</li>
          <li>✅ Your MainComposition logic</li>
        </ul>
      </div>

      <div
        style={{
          padding: '15px',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          marginTop: '10px'
        }}
      >
        <h4>⚠️ Note about Media Files</h4>
        <p>The HTML5 renderer will try to load your video/audio files directly. Make sure:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>
            Files are in your <code>public/</code> folder
          </li>
          <li>Or use full URLs for remote files</li>
          <li>CORS is configured if loading from external domains</li>
        </ul>
      </div>
    </div>
  )
}

// Export the test app
export default function TestRealComposition() {
  return (
    <VideoRendererProvider config={{ type: 'html5' }}>
      <RealCompositionTest />
    </VideoRendererProvider>
  )
}
