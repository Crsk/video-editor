import { VideoEditor } from './components/video-editor/video-editor'
import { ThemeProvider } from './providers/theme-provider'
import { Topbar } from './components/topbar/topbar'
import { Track } from './components/video-editor/types'

function App() {
  const initialTracks: Track[] = [
    {
      name: 'Track 1',
      clips: [
        {
          id: 'clip-1',
          from: 0,
          durationInFrames: 1,
          type: 'video',
          src: 'manson_clone.mp4'
        }
      ]
    },
    {
      name: 'Track 2',
      clips: [
        {
          id: 'clip-2',
          from: 0,
          durationInFrames: 1,
          type: 'video',
          src: 'manson_clone.mp4'
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
          durationInFrames: 1,
          type: 'audio',
          src: 'spectre.mp3'
        }
      ]
    }
  ]

  return (
    <>
      <ThemeProvider>
        <Topbar />
        <div className="h-[200vh] pt-32">
          <VideoEditor tracks={initialTracks} />
        </div>
      </ThemeProvider>
    </>
  )
}

export default App
