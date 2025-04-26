import { FC } from 'react'
import { EditorProvider } from './context/editor-context'
import { Timeline } from './timeline/timeline'
import { VideoPlayer } from './player'
import { Track } from './types'

type EditorProps = { tracks: Track[] }
export const VideoEditor: FC<EditorProps> = ({ tracks }) => {
  return (
    <EditorProvider initialTracks={tracks}>
      <VideoPlayer />
      <Timeline />
    </EditorProvider>
  )
}
