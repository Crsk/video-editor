import { FC } from 'react'
import { VideoEditorProvider } from '~/components/video-editor/context/video-editor-provider'
import { Timeline } from '~/components/video-editor/timeline/timeline'
import { VideoPlayer } from '~/components/video-editor/player'
import { VideoRenderControls } from '~/components/video-editor/controls/video-render-controls'
import { Track } from '~/components/video-editor/types'
import { ZoomPlusControl } from '~/components/video-editor/controls/zoom-plus-control'
import { ZoomMinusControl } from '~/components/video-editor/controls/zoom-minus-control'
import { SelectedClipVolumeControl } from '~/components/video-editor/controls/selected-clip-volume-control'
import { TimeDisplay } from '~/components/video-editor/controls/time-display'
import { VideoLoopControl } from '~/components/video-editor/controls/video-loop-control'
import { PlayPauseControl } from '~/components/video-editor/controls/play-pause-control'
import { DeleteClipControl } from '~/components/video-editor/controls/delete-clip-control'
import { VideoUpload } from '~/components/video-editor/upload/video-upload'
import { VideoComposer } from './timeline/video-composer'

type EditorProps = { tracks: Track[] }
export const VideoEditor: FC<EditorProps> = ({ tracks }) => {
  return (
    <VideoEditorProvider initialTracks={tracks}>
      <VideoPlayer />
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
          <SelectedClipVolumeControl />
          <DeleteClipControl />
          <ZoomMinusControl />
          <ZoomPlusControl />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <VideoUpload />
        </div>
        <div className="flex-1">
          <VideoRenderControls />
        </div>
      </div>
      <Timeline
        styles={{
          root: 'bg-background p-4 rounded-lg mt-6',
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
