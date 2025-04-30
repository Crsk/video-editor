import { FC } from 'react'
import { EditorProvider } from '~/components/video-editor/context/editor-context'
import { Timeline } from '~/components/video-editor/timeline/timeline'
import { VideoPlayer } from '~/components/video-editor/player'
import { Track } from '~/components/video-editor/types'
import { ZoomPlusControl } from '~/components/video-editor/controls/zoom-plus-control'
import { ZoomMinusControl } from '~/components/video-editor/controls/zoom-minus-control'
import { SelectedClipVolumeControl } from '~/components/video-editor/controls/selected-clip-volume-control'
import { TimeDisplay } from '~/components/video-editor/controls/time-display'
import { VideoLoopControl } from '~/components/video-editor/controls/video-loop-control'
import { PlayPauseControl } from '~/components/video-editor/controls/play-pause-control'

type EditorProps = { tracks: Track[] }
export const VideoEditor: FC<EditorProps> = ({ tracks }) => {
  return (
    <EditorProvider initialTracks={tracks}>
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
          <ZoomMinusControl />
          <ZoomPlusControl />
        </div>
      </div>
      <Timeline />
    </EditorProvider>
  )
}
