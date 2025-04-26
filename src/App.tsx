import { Editor } from './components/video-timeline/editor'
import { ThemeProvider } from './providers/theme-provider'
import { Topbar } from './components/topbar/topbar'

function App() {
  return (
    <>
      <ThemeProvider>
        <Topbar />
        <Editor />
      </ThemeProvider>
    </>
  )
}

export default App
