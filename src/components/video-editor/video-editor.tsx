import { FC } from 'react'
import { EditorProvider } from '~/components/video-editor/context/editor-context'
import { Timeline } from '~/components/video-editor/timeline/timeline'
import { VideoPlayer } from '~/components/video-editor/player'
import { Track } from '~/components/video-editor/types'
import { TimelineControls } from './timeline/timeline-controls'
import { RemotionTimelineProvider } from './timeline/context/remotion-timeline-context'

type EditorProps = { tracks: Track[] }
export const VideoEditor: FC<EditorProps> = ({ tracks }) => {
  return (
    <EditorProvider initialTracks={tracks}>
      <VideoPlayer />
      <RemotionTimelineProvider>
        <TimelineControls />
        <Timeline />
      </RemotionTimelineProvider>
    </EditorProvider>
  )
}
