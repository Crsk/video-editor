import { FC, useRef } from 'react'
import { Button } from '~/components/ui/button'
import { Track } from '../types'

interface TrackControlsProps {
  tracks: Track[]
  selectedTrackIndex: number | null
  setSelectedTrackIndex: (index: number | null) => void
  isLoading: boolean
  createTrack: () => void
  addVideoClip: (trackIndex: number, src: string) => string
  addAudioClip: (trackIndex: number, src: string) => string
  addClipToBeginning: (trackIndex: number, src: string, type: 'video' | 'audio') => string
  addClipToEnd: (trackIndex: number, src: string, type: 'video' | 'audio') => string
  hasPendingOperations: () => boolean // Used by parent component to track loading state
}

export const TrackControls: FC<TrackControlsProps> = ({
  tracks,
  selectedTrackIndex,
  setSelectedTrackIndex,
  isLoading,
  createTrack,
  addVideoClip,
  addAudioClip,
  addClipToBeginning,
  addClipToEnd
  /* hasPendingOperations */
}) => {
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || selectedTrackIndex === null) return

    const fileUrl = URL.createObjectURL(file)
    addVideoClip(selectedTrackIndex, fileUrl)

    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || selectedTrackIndex === null) return

    const fileUrl = URL.createObjectURL(file)
    addAudioClip(selectedTrackIndex, fileUrl)

    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  return (
    <div className="flex items-center gap-2 mb-4 p-2 bg-secondary/10 rounded">
      <Button onClick={createTrack} variant="outline" size="sm">
        Create Track
      </Button>

      <select
        className="p-1 border rounded bg-background text-sm"
        value={selectedTrackIndex === null ? '' : selectedTrackIndex}
        onChange={e => setSelectedTrackIndex(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">Select Track</option>
        {tracks.map((track, index) => (
          <option key={index} value={index}>
            {track.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <Button
          onClick={() => videoInputRef.current?.click()}
          variant="outline"
          size="sm"
          disabled={selectedTrackIndex === null || isLoading}
        >
          Add Video
        </Button>
        <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />

        <Button
          onClick={() => audioInputRef.current?.click()}
          variant="outline"
          size="sm"
          disabled={selectedTrackIndex === null || isLoading}
        >
          Add Audio
        </Button>
        <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
      </div>

      {selectedTrackIndex !== null && tracks[selectedTrackIndex]?.items.some(item => item.type === 'video') && (
        <div className="flex gap-2 ml-2">
          <Button
            onClick={() => {
              if (selectedTrackIndex === null) return
              const sampleVideoUrl = '/sample-video.mp4'
              addClipToBeginning(selectedTrackIndex, sampleVideoUrl, 'video')
            }}
            variant="secondary"
            size="sm"
            disabled={isLoading}
          >
            Add to Start
          </Button>

          <Button
            onClick={() => {
              if (selectedTrackIndex === null) return
              const sampleVideoUrl = '/sample-video.mp4'
              addClipToEnd(selectedTrackIndex, sampleVideoUrl, 'video')
            }}
            variant="secondary"
            size="sm"
            disabled={isLoading}
          >
            Add to End
          </Button>
        </div>
      )}

      {isLoading && <div className="ml-2 text-sm text-muted-foreground animate-pulse">Processing media...</div>}
    </div>
  )
}
