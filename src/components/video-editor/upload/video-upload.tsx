import { useState, useRef, ChangeEvent, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { useEditor } from '~/components/video-editor/context/video-editor-context'
import { v4 as uuidv4 } from 'uuid'

export const VideoUpload = () => {
  const { tracks, setTracks } = useEditor()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0)
  const [useDefaultFile, setUseDefaultFile] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setUseDefaultFile(false)
    }
  }

  const handleSelectClick = () => {
    fileInputRef.current?.click()
  }

  const handleUseTestFile = () => {
    setUseDefaultFile(true)
    setSelectedFile(null)
  }

  const handleLoadIntoTimeline = useCallback(() => {
    if ((!selectedFile && !useDefaultFile) || isLoading) return

    setIsLoading(true)

    const src = useDefaultFile ? 'manson_clone.mp4' : URL.createObjectURL(selectedFile!)

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = src

    video.onloadedmetadata = () => {
      const FPS = 30
      const durationInSeconds = video.duration
      const durationInFrames = Math.ceil(durationInSeconds * FPS)

      setTracks(prevTracks => {
        const newTracks = JSON.parse(JSON.stringify(prevTracks))
        const items = newTracks[selectedTrackIndex].items
        const lastItemIndex = items.length - 1
        const lastItem = lastItemIndex >= 0 ? items[lastItemIndex] : null
        const startFrame = lastItem ? lastItem.from + lastItem.durationInFrames : 0
        const newItemId = uuidv4()
        const newItem = {
          id: newItemId,
          from: startFrame,
          durationInFrames: durationInFrames,
          type: 'video',
          src
        }

        newTracks[selectedTrackIndex].items = [...newTracks[selectedTrackIndex].items, newItem]

        return newTracks
      })

      setSelectedFile(null)
      setUseDefaultFile(false)
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    video.onerror = () => {
      console.error('Error loading video for duration calculation')
      alert('Failed to load video. Please try another file.')
      setSelectedFile(null)
      setUseDefaultFile(false)
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [selectedFile, useDefaultFile, selectedTrackIndex, isLoading, setTracks])

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
            {selectedFile ? selectedFile.name : useDefaultFile ? 'manson_clone.mp4' : 'No file selected'}
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

          <Button onClick={handleLoadIntoTimeline} disabled={(!selectedFile && !useDefaultFile) || isLoading}>
            {isLoading ? 'Loading...' : 'Load into Timeline'}
          </Button>
        </div>
      </div>
    </div>
  )
}
