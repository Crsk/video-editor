import { Button } from '~/components/ui/button'
import { useEditor } from '~/components/video-editor/context/video-editor-provider'
import { useVideoUpload } from '~/components/video-editor/hooks/use-video-upload'
import { useTrackManager } from '~/components/video-editor/hooks/use-track-manager'
import { useCallback, useEffect } from 'react'
import { useEvents } from '~/components/video-editor/hooks/use-events'

export const VideoUpload = () => {
  const { tracks } = useEditor()
  const {
    selectedTrackIndex,
    /* selectedFile,
    useDefaultFile,
    defaultFileName,
    fileInputRef,
    handleFileChange,
    handleSelectClick, */
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

  // prettier-ignore
  const sample43sWords = [{"start":0,"end":0.3,"word":" Facebook"},{"start":0.3,"end":0.62,"word":" found"},{"start":0.62,"end":0.88,"word":" that"},{"start":0.88,"end":1.26,"word":" 50"},{"start":1.26,"end":1.54,"word":"%"},{"start":1.54,"end":1.72,"word":" of"},{"start":1.72,"end":1.98,"word":" ads"},{"start":1.98,"end":2.3,"word":" don't"},{"start":2.3,"end":2.54,"word":" last"},{"start":2.54,"end":2.72,"word":" more"},{"start":2.72,"end":2.88,"word":" than"},{"start":2.88,"end":3.06,"word":" two"},{"start":3.06,"end":3.34,"word":" days,"},{"start":3.34,"end":3.54,"word":" so"},{"start":3.54,"end":3.7,"word":" this"},{"start":3.7,"end":3.82,"word":" is"},{"start":3.82,"end":3.98,"word":" why"},{"start":3.98,"end":4.32,"word":" volume"},{"start":4.32,"end":4.58,"word":" is"},{"start":4.58,"end":4.92,"word":" crucial"},{"start":4.92,"end":5.12,"word":" for"},{"start":5.12,"end":5.64,"word":" success."},{"start":5.96,"end":6.18,"word":" Meta"},{"start":6.18,"end":6.36,"word":" is"},{"start":6.36,"end":6.7,"word":" also"},{"start":6.7,"end":7.3,"word":" recommending"},{"start":7.3,"end":7.94,"word":" modular"},{"start":7.94,"end":8.42,"word":" creative"},{"start":8.42,"end":8.66,"word":" ad"},{"start":8.66,"end":8.96,"word":" scale."},{"start":9.14,"end":9.34,"word":" Now"},{"start":9.34,"end":9.6,"word":" on"},{"start":9.6,"end":9.78,"word":" to"},{"start":9.78,"end":9.96,"word":" the"},{"start":9.96,"end":10.22,"word":" second"},{"start":10.22,"end":10.62,"word":" technique,"},{"start":10.84,"end":10.92,"word":" which"},{"start":10.92,"end":11.04,"word":" I"},{"start":11.04,"end":11.28,"word":" call"},{"start":11.28,"end":11.76,"word":" substitute."},{"start":11.78,"end":12.3,"word":" If"},{"start":12.3,"end":12.4,"word":" you"},{"start":12.4,"end":12.52,"word":" have"},{"start":12.52,"end":12.6,"word":" a"},{"start":12.6,"end":12.74,"word":" winning"},{"start":12.74,"end":13.02,"word":" ad,"},{"start":13.14,"end":13.2,"word":" you"},{"start":13.2,"end":13.34,"word":" can"},{"start":13.34,"end":13.52,"word":" turn"},{"start":13.52,"end":13.68,"word":" it"},{"start":13.68,"end":13.98,"word":" into"},{"start":13.98,"end":14.58,"word":" a"},{"start":14.58,"end":14.8,"word":" wildly"},{"start":14.8,"end":15.18,"word":" different"},{"start":15.18,"end":15.9,"word":" format."},{"start":15.9,"end":16.4,"word":" You"},{"start":16.4,"end":16.86,"word":" already"},{"start":16.86,"end":17.12,"word":" have"},{"start":17.12,"end":17.38,"word":" something"},{"start":17.38,"end":17.58,"word":" that"},{"start":17.58,"end":17.88,"word":" works,"},{"start":17.88,"end":18.06,"word":" and"},{"start":18.06,"end":18.2,"word":" now"},{"start":18.2,"end":18.36,"word":" you"},{"start":18.36,"end":18.64,"word":" just"},{"start":18.64,"end":18.92,"word":" need"},{"start":18.92,"end":19.46,"word":" more"},{"start":19.46,"end":19.96,"word":" like"},{"start":19.96,"end":20.16,"word":" it."},{"start":20.28,"end":20.38,"word":" You"},{"start":20.38,"end":20.56,"word":" can"},{"start":20.56,"end":20.94,"word":" turn"},{"start":20.94,"end":21.62,"word":" your"},{"start":21.62,"end":22,"word":" winning"},{"start":22,"end":22.52,"word":" static"},{"start":22.52,"end":22.88,"word":" ad"},{"start":22.88,"end":23.18,"word":" into"},{"start":23.18,"end":23.36,"word":" a"},{"start":23.36,"end":23.6,"word":" video"},{"start":23.6,"end":24,"word":" ad,"},{"start":24.36,"end":24.64,"word":" turn"},{"start":24.64,"end":24.8,"word":" your"},{"start":24.8,"end":25.04,"word":" winning"},{"start":25.04,"end":25.62,"word":" video"},{"start":25.62,"end":25.94,"word":" ad"},{"start":25.94,"end":26.16,"word":" into"},{"start":26.16,"end":26.34,"word":" a"},{"start":26.34,"end":26.74,"word":" static"},{"start":26.74,"end":27.06,"word":" ad,"},{"start":27.06,"end":27.6,"word":" turn"},{"start":27.6,"end":27.78,"word":" your"},{"start":27.78,"end":28.26,"word":" statics"},{"start":28.26,"end":28.44,"word":" into"},{"start":28.44,"end":28.62,"word":" a"},{"start":28.62,"end":28.78,"word":" new"},{"start":28.78,"end":29.34,"word":" carousel"},{"start":29.34,"end":29.62,"word":" ad."},{"start":29.94,"end":30.42,"word":" These"},{"start":30.42,"end":30.54,"word":" are"},{"start":30.54,"end":30.7,"word":" all"},{"start":30.7,"end":30.9,"word":" little"},{"start":30.9,"end":31.4,"word":" variations"},{"start":31.4,"end":31.68,"word":" that"},{"start":31.68,"end":31.8,"word":" you"},{"start":31.8,"end":31.94,"word":" can"},{"start":31.94,"end":32.2,"word":" do"},{"start":32.2,"end":32.88,"word":" to"},{"start":32.88,"end":33.7,"word":" help"},{"start":33.7,"end":33.98,"word":" you"},{"start":33.98,"end":34.56,"word":" increase"},{"start":34.56,"end":34.82,"word":" your"},{"start":34.82,"end":35.04,"word":" ad"},{"start":35.04,"end":35.44,"word":" volume."},{"start":35.6,"end":35.7,"word":" But"},{"start":35.7,"end":35.88,"word":" just"},{"start":35.88,"end":36.26,"word":" remember"},{"start":36.26,"end":36.5,"word":" to"},{"start":36.5,"end":36.7,"word":" keep"},{"start":36.7,"end":36.9,"word":" your"},{"start":36.9,"end":37.14,"word":" winning"},{"start":37.14,"end":37.78,"word":" trait"},{"start":37.78,"end":38.16,"word":" intact."},{"start":38.4,"end":38.88,"word":" Your"},{"start":38.88,"end":39.22,"word":" winning"},{"start":39.22,"end":39.62,"word":" trait"},{"start":39.62,"end":39.88,"word":" of"},{"start":39.88,"end":40.14,"word":" this"},{"start":40.14,"end":40.7,"word":" ad"},{"start":40.7,"end":40.92,"word":" could"},{"start":40.92,"end":41.1,"word":" be"},{"start":41.1,"end":41.28,"word":" the"},{"start":41.28,"end":41.66,"word":" creator,"},{"start":41.88,"end":42.18,"word":" it"},{"start":42.18,"end":42.3,"word":" could"},{"start":42.3,"end":42.42,"word":" be"},{"start":42.42,"end":42.58,"word":" the"},{"start":42.58,"end":42.88,"word":" script,"},{"start":43.04,"end":43.12,"word":" it"},{"start":43.12,"end":43.22,"word":" could"},{"start":43.22,"end":43.3,"word":" be."}]
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
        {/* <div className="flex items-center gap-4">
          <Button onClick={handleSelectClick} variant="outline">
            Select Video
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
          <span className="text-sm">
            {selectedFile ? selectedFile.name : useDefaultFile ? defaultFileName : 'No file selected'}
          </span>
        </div> */}

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
