import { Button } from '~/components/ui/button'
import { useEditor } from '~/components/video-editor/context/video-editor-provider'
import { useAudioUpload } from '~/components/video-editor/hooks/use-audio-upload'

export const AudioUpload = () => {
  const { tracks } = useEditor()
  const {
    selectedFile,
    selectedTrackIndex,
    fileInputRef,
    handleFileChange,
    handleSelectClick,
    handleTrackIndexChange
  } = useAudioUpload()

  return (
    <div className="bg-background p-4 rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-4">Audio Upload</h3>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleSelectClick} variant="outline">
            Select Audio
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
          <span className="text-sm">{selectedFile ? selectedFile.name : 'No file selected'}</span>
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
        </div>
      </div>
    </div>
  )
}
