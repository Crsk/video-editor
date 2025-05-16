import { Button } from '~/components/ui/button'
import { useEditor } from '~/components/video-editor/context/video-editor-provider'
import { useVideoUpload } from '~/components/video-editor/hooks/use-video-upload'

export const VideoUpload = () => {
  const { tracks } = useEditor()
  const {
    selectedFile,
    selectedTrackIndex,
    useDefaultFile,
    defaultFileName,
    fileInputRef,
    handleFileChange,
    handleSelectClick,
    handleTrackIndexChange,
    loadVideoIntoTimeline
  } = useVideoUpload()

  // Internal test file handlers
  const handleUseTestFile = () => {
    handleTrackIndexChange(selectedTrackIndex)
    loadVideoIntoTimeline({ file: 'manson_clone.mp4', trackIndex: selectedTrackIndex })
  }

  const handleUse43sFile = () => {
    handleTrackIndexChange(selectedTrackIndex)
    loadVideoIntoTimeline({ file: '43s.mp4', trackIndex: selectedTrackIndex })
  }

  return (
    <div className="bg-background p-4 rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-4">Video Upload</h3>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleSelectClick} variant="outline">
            Select Video
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
          <span className="text-sm">
            {selectedFile ? selectedFile.name : useDefaultFile ? defaultFileName : 'No file selected'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <select
            className="p-2 rounded-md bg-background border border-input"
            value={selectedTrackIndex}
            onChange={e => handleTrackIndexChange(Number(e.target.value))}
          >
            {tracks.map((track, index) => (
              <option key={index} value={index}>
                {track.name}
              </option>
            ))}
          </select>

          <Button onClick={handleUseTestFile} variant="outline" className="mr-2">
            Use Test File
          </Button>

          <Button onClick={handleUse43sFile} variant="outline" className="mr-2">
            Use 43s File
          </Button>
        </div>
      </div>
    </div>
  )
}
