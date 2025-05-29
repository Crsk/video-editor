import { VideoRendererProvider } from './lib/video-renderer/provider'
import App from './App'

function AppWrapped() {
  return (
    <VideoRendererProvider config={{ type: 'html5' }}>
      <App />
    </VideoRendererProvider>
  )
}

export default AppWrapped
