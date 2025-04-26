import { FC } from 'react'
import { EditorProvider } from './context/editor-context'
import { Timeline } from './timeline/timeline'
import { VideoPlayer } from './player'
import { Track } from './types'

type EditorProps = { initialTracks?: Track[] }
export const Editor: FC<EditorProps> = ({ initialTracks = [] }) => {
  return (
    <EditorProvider initialTracks={initialTracks}>
      <VideoPlayer />
      <Timeline />
    </EditorProvider>
  )
}
