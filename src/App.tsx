import { VideoEditor } from './components/video-editor/video-editor'
import { ThemeProvider } from './providers/theme-provider'
import { Topbar } from './components/topbar/topbar'
import { Track } from './components/video-editor/types'

function App() {
  const initialTracks: Track[] = [
    {
      name: 'Track 1',
      items: [],
      volume: 1
    },
    {
      name: 'Track 2',
      items: [],
      volume: 1
    },
    {
      name: 'Audio Track',
      items: [],
      volume: 1
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
