import { FC } from 'react'
import { VideoEditorProvider } from '~/components/video-editor/context/video-editor-provider'
import { VideoPlayer } from '~/components/video-editor/player'
import { Track } from '~/components/video-editor/types'
import { VideoUpload } from '~/components/video-editor/upload/video-upload'
import { Transcript } from './transcript'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable'
import { TimelineComponent } from './timeline'

type EditorProps = { tracks: Track[] }
export const VideoEditor: FC<EditorProps> = ({ tracks }) => {
  return (
    <div className="flex h-[calc(100vh)] items-center bg-background">
      <VideoEditorProvider initialTracks={tracks}>
        <ResizablePanelGroup direction="vertical" autoSaveId="video-editor-panel-vertical">
          <ResizablePanel defaultSize={70}>
            <ResizablePanelGroup direction="horizontal" autoSaveId="video-editor-panel-horizontal">
              <ResizablePanel
                defaultSize={24}
                minSize={15}
                maxSize={50}
                collapsible
                className="flex flex-col justify-between"
              >
                <Transcript />
                <VideoUpload />
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-border" />
              <ResizablePanel defaultSize={70} className="py-8">
                <VideoPlayer />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border" />

          <ResizablePanel defaultSize={25} minSize={0.5} maxSize={50}>
            <TimelineComponent />
          </ResizablePanel>
        </ResizablePanelGroup>
      </VideoEditorProvider>
    </div>
  )
}
