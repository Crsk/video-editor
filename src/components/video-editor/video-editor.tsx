import { FC } from 'react'
import { VideoEditorProvider } from '~/components/video-editor/context/video-editor-provider'
import { Timeline } from '~/components/video-editor/timeline/timeline'
import { VideoPlayer } from '~/components/video-editor/player'
import { Track } from '~/components/video-editor/types'
import { SelectedVideoRenderSettingsControl } from '~/components/video-editor/controls/selected-video-render-settings-control'
import { TimeDisplay } from '~/components/video-editor/controls/time-display'
import { VideoLoopControl } from '~/components/video-editor/controls/video-loop-control'
import { PlayPauseControl } from '~/components/video-editor/controls/play-pause-control'
import { VideoUpload } from '~/components/video-editor/upload/video-upload'
import { VideoComposer } from './timeline/video-composer'
import { ZoomMinusControl } from './controls/zoom-minus-control'
import { ZoomPlusControl } from './controls/zoom-plus-control'

type EditorProps = { tracks: Track[] }
export const VideoEditor: FC<EditorProps> = ({ tracks }) => {
  return (
    <VideoEditorProvider initialTracks={tracks}>
      <div className="h-[calc(100vh-200px)]">
        <VideoPlayer />
      </div>
      <div className="flex gap-2 mb-2 w-full justify-center py-8">
        <PlayPauseControl />
        <VideoLoopControl />
      </div>
      <div className="flex gap-2 mb-2 w-full justify-between">
        <div></div>
        <div className="">
          <TimeDisplay />
        </div>
        <div className="flex gap-2">
          <SelectedVideoRenderSettingsControl />
          <ZoomMinusControl />
          <ZoomPlusControl />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <VideoUpload />
        </div>
      </div>
      <Timeline
        styles={{
          root: 'pl-4',
          timeMarker: {
            handle: '',
            line: ''
          },
          timeRuler: {
            root: '',
            gridLines: '',
            label: ''
          },
          track: {
            root: '',
            clip: {
              root: '',
              content: '',
              active: {
                root: '',
                resizeHandle: '',
                content: '',
                dragOrResize: ''
              }
            }
          }
        }}
      />

      <VideoComposer />
    </VideoEditorProvider>
  )
}
