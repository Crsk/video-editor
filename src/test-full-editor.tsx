import { VideoEditor } from './components/video-editor/video-editor'
import { ThemeProvider } from './providers/theme-provider'
import { Topbar } from './components/topbar/topbar'
import { Track } from './components/video-editor/types'
import { VideoRendererProvider } from './lib/video-renderer/provider'

// prettier-ignore
const words = [{"word":"I","start":0,"end":0.14000000059604645},{"word":"launched","start":0.14000000059604645,"end":0.4000000059604645},{"word":"15","start":0.4000000059604645,"end":0.9599999785423279},{"word":"different","start":0.9599999785423279,"end":1.2599999904632568},{"word":"video","start":1.2599999904632568,"end":1.559999942779541},{"word":"ads","start":1.559999942779541,"end":1.7999999523162842},{"word":"last","start":1.7999999523162842,"end":2.0399999618530273},{"word":"week","start":2.0399999618530273,"end":2.299999952316284},{"word":"and","start":2.299999952316284,"end":2.5399999618530273},{"word":"found","start":2.5399999618530273,"end":2.700000047683716},{"word":"a","start":2.700000047683716,"end":2.859999895095825},{"word":"winner","start":2.859999895095825,"end":3.0799999237060547},{"word":"in","start":3.0799999237060547,"end":3.319999933242798},{"word":"just","start":3.319999933242798,"end":3.4600000381469727},{"word":"3","start":3.4600000381469727,"end":3.7200000286102295},{"word":"days.","start":3.7200000286102295,"end":4.460000038146973},{"word":"Discover","start":4.460000038146973,"end":4.820000171661377},{"word":"how","start":4.820000171661377,"end":5.239999771118164},{"word":"Sovran's","start":5.239999771118164,"end":5.679999828338623},{"word":"customer","start":5.679999828338623,"end":6.079999923706055},{"word":"achieved","start":6.079999923706055,"end":6.400000095367432},{"word":"this.","start":6.400000095367432,"end":6.71999979019165}]

function TestFullEditor() {
  const initialTracks: Track[] = [
    {
      name: 'Track 1',
      clips: [
        {
          id: 'clip-1',
          from: 0,
          durationInFrames: 1,
          type: 'video',
          src: 'manson_clone.mp4',
          words
        }
      ]
    },
    /* {
      name: 'Track 2',
      clips: [
        {
          id: 'clip-2',
          from: 0,
          durationInFrames: 1,
          type: 'video',
          src: 'manson_clone.mp4',
          words
        }
      ]
    }, */
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
    <VideoRendererProvider config={{ type: 'html5' }}>
      <ThemeProvider>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: '#4caf50',
            color: 'white',
            padding: '8px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🎉 HTML5 Renderer Active - Full Video Editor Test
        </div>
        <div style={{ paddingTop: '40px' }}>
          <Topbar />
          <VideoEditor tracks={initialTracks} />
        </div>
      </ThemeProvider>
    </VideoRendererProvider>
  )
}

export default TestFullEditor
