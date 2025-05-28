import { Button } from '~/components/ui/button'
import { useEditor } from '~/components/video-editor/context/video-editor-provider'
import { useVideoUpload } from '~/components/video-editor/hooks/use-video-upload'
import { useTrackManager } from '~/components/video-editor/hooks/use-track-manager'
import { useCallback, useEffect } from 'react'
import { useEvents } from '~/components/video-editor/hooks/use-events'

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
  const { loadTranscriptForSrc } = useTrackManager()

  // Sample transcript data for demo videos
  const mansonWords = [
    { word: 'I', start: 0, end: 0.14 },
    { word: 'launched', start: 0.14, end: 0.4 },
    { word: '15', start: 0.4, end: 0.96 },
    { word: 'different', start: 0.96, end: 1.26 },
    { word: 'video', start: 1.26, end: 1.56 },
    { word: 'ads', start: 1.56, end: 1.8 },
    { word: 'last', start: 1.8, end: 2.04 },
    { word: 'week', start: 2.04, end: 2.3 },
    { word: 'and', start: 2.3, end: 2.54 },
    { word: 'found', start: 2.54, end: 2.7 },
    { word: 'a', start: 2.7, end: 2.86 },
    { word: 'winner', start: 2.86, end: 3.08 },
    { word: 'in', start: 3.08, end: 3.32 },
    { word: 'just', start: 3.32, end: 3.46 },
    { word: '3', start: 3.46, end: 3.72 },
    { word: 'days.', start: 3.72, end: 4.46 },
    { word: 'Discover', start: 4.46, end: 4.82 },
    { word: 'how', start: 4.82, end: 5.24 },
    { word: "Sovran's", start: 5.24, end: 5.68 },
    { word: 'customer', start: 5.68, end: 6.08 },
    { word: 'achieved', start: 6.08, end: 6.4 },
    { word: 'this.', start: 6.4, end: 6.72 }
  ]

  const sample43sWords = [
    { word: 'This', start: 0.5, end: 0.7 },
    { word: 'is', start: 0.7, end: 0.9 },
    { word: 'a', start: 0.9, end: 1.0 },
    { word: 'sample', start: 1.0, end: 1.5 },
    { word: 'transcript', start: 1.5, end: 2.2 },
    { word: 'for', start: 2.2, end: 2.4 },
    { word: 'the', start: 2.4, end: 2.6 },
    { word: '43', start: 2.6, end: 3.0 },
    { word: 'second', start: 3.0, end: 3.4 },
    { word: 'video', start: 3.4, end: 3.9 },
    { word: 'clip', start: 3.9, end: 4.3 }
  ]
  const { notifyMediaLoaded, useOnMediaLoaded } = useEvents()
  const mediaLoaded = useOnMediaLoaded()

  // Internal test file handlers
  const handleUseTestFile = useCallback(async () => {
    handleTrackIndexChange(selectedTrackIndex)
    await loadVideoIntoTimeline({ file: 'manson_clone.mp4', trackIndex: selectedTrackIndex })
    notifyMediaLoaded({
      trackIndex: selectedTrackIndex,
      clipIndex: tracks[selectedTrackIndex]?.clips.length || 0,
      file: new File([], 'manson_clone.mp4'),
      words: mansonWords
    })
  }, [handleTrackIndexChange, loadVideoIntoTimeline, selectedTrackIndex, notifyMediaLoaded, tracks])

  const handleUse43sFile = useCallback(async () => {
    handleTrackIndexChange(selectedTrackIndex)
    await loadVideoIntoTimeline({ file: '43s.mp4', trackIndex: selectedTrackIndex })
    notifyMediaLoaded({
      trackIndex: selectedTrackIndex,
      clipIndex: tracks[selectedTrackIndex]?.clips.length || 0,
      file: new File([], '43s.mp4'),
      words: sample43sWords
    })
  }, [handleTrackIndexChange, loadVideoIntoTimeline, selectedTrackIndex, notifyMediaLoaded, tracks])

  useEffect(() => {
    if (!mediaLoaded || !mediaLoaded.file) return

    const { file, words } = mediaLoaded
    const src = file.name
    const wordsExist = words && Array.isArray(words) && words.length > 0
    if (wordsExist) loadTranscriptForSrc({ src, words })
  }, [mediaLoaded])

  return (
    <div className="bg-background p-4 rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-4">Test</h3>

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
