import { useState, useRef, ChangeEvent, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { useEditor } from '~/components/video-editor/context/video-editor-provider'
import { useVideoUpload } from '~/components/video-editor/hooks/use-video-upload'

export const VideoUpload = () => {
  const { tracks } = useEditor()
  const { selectVideoFile, loadVideoIntoTimeline } = useVideoUpload()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0)
  const [useDefaultFile, setUseDefaultFile] = useState<boolean>(false)
  const [defaultFileName, setDefaultFileName] = useState<string>('manson_clone.mp4')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setUseDefaultFile(false)
    }
  }

  const handleSelectClick = async () => {
    const file = await selectVideoFile()
    if (file) {
      setSelectedFile(file)
      setUseDefaultFile(false)
    }
  }

  const handleUseTestFile = () => {
    setUseDefaultFile(true)
    setDefaultFileName('manson_clone.mp4')
    setSelectedFile(null)
  }

  const handleUse43sFile = () => {
    setUseDefaultFile(true)
    setDefaultFileName('43s.mp4')
    setSelectedFile(null)
  }

  const handleLoadIntoTimeline = useCallback(async () => {
    if ((!selectedFile && !useDefaultFile) || isLoading) return

    setIsLoading(true)

    try {
      const source = useDefaultFile ? defaultFileName : selectedFile!
      await loadVideoIntoTimeline(source, selectedTrackIndex)

      setSelectedFile(null)
      setUseDefaultFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error loading video:', error)
      alert('Failed to load video. Please try another file.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedFile, useDefaultFile, defaultFileName, selectedTrackIndex, isLoading, loadVideoIntoTimeline])

  return (
    <div className="bg-background p-4 rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-4">Video Upload</h3>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleSelectClick} variant="outline" disabled={isLoading}>
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
            onChange={e => setSelectedTrackIndex(Number(e.target.value))}
            disabled={isLoading}
          >
            {tracks.map((track, index) => (
              <option key={index} value={index}>
                {track.name}
              </option>
            ))}
          </select>

          <Button onClick={handleUseTestFile} variant="outline" className="mr-2" disabled={isLoading}>
            Use Test File
          </Button>

          <Button onClick={handleUse43sFile} variant="outline" className="mr-2" disabled={isLoading}>
            Use 43s File
          </Button>

          <Button onClick={handleLoadIntoTimeline} disabled={(!selectedFile && !useDefaultFile) || isLoading}>
            {isLoading ? 'Loading...' : 'Load into Timeline'}
          </Button>
        </div>
      </div>
    </div>
  )
}
