import { VideoEditor } from './components/video-editor/video-editor'
import { ThemeProvider } from './providers/theme-provider'
import { Topbar } from './components/topbar/topbar'
import { Track } from './components/video-editor/types'

function App() {
  const initialTracks: Track[] = [
    {
      name: 'Track 1',
      items: [
        {
          id: 'item-1',
          from: 0,
          durationInFrames: 1,
          type: 'video' as const,
          src: 'manson_clone.mp4'
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
          src: 'manson_clone.mp4'
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
