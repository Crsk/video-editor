import { useVideoUpload } from '../components/video-editor/hooks/use-video-upload'
import { Button } from '../components/ui/button'
import { Word } from '../components/video-editor/hooks/use-video-upload.types'

export const LoadVideoWithTranscript = () => {
  const { loadVideoIntoTimeline } = useVideoUpload()

  const handleLoadVideoWithTranscript = async () => {
    // Example of loading a video with transcript data
    const transcriptData: Word[] = [
      { word: 'Hello', start: 0, end: 0.5 },
      { word: 'world', start: 0.5, end: 1.0 },
      { word: 'this', start: 1.2, end: 1.5 },
      { word: 'is', start: 1.5, end: 1.7 },
      { word: 'a', start: 1.7, end: 1.9 },
      { word: 'transcript', start: 1.9, end: 2.5 },
      { word: 'example', start: 2.7, end: 3.2 }
    ]

    // Load the video into the timeline with transcript data
    await loadVideoIntoTimeline({
      file: 'path/to/your/video.mp4',
      trackIndex: 0,
      words: transcriptData
    })
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Load Video with Transcript Example</h2>
      <Button onClick={handleLoadVideoWithTranscript}>Load Video with Transcript</Button>
    </div>
  )
}
