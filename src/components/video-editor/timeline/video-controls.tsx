import { FC, useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { VideoItem } from '../types'
import { useTrackManager } from '../hooks/use-track-manager'
import { TrackControls } from './track-controls'

interface VideoControlsProps {
  selectedVideoItem: { trackIndex: number; itemId: string } | null
  tracks: any[]
  positionX: number
  setPositionX: (value: number) => void
  positionY: number
  setPositionY: (value: number) => void
  handleVideoRenderOptionChange: (itemId: string, renderOption: 'default' | 'contain-blur' | 'cover') => void
  handleVideoPositionChange: (itemId: string, positionX: number, positionY: number) => void
}

export const VideoControls: FC<VideoControlsProps> = ({
  selectedVideoItem,
  tracks,
  positionX,
  setPositionX,
  positionY,
  setPositionY,
  handleVideoRenderOptionChange,
  handleVideoPositionChange
}) => {
  const { createTrack, addVideoClip, addAudioClip, addClipToBeginning, addClipToEnd, hasPendingOperations } =
    useTrackManager()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null)

  // Monitor loading state for media operations
  useEffect(() => {
    if (hasPendingOperations()) {
      setIsLoading(true)
      const checkLoading = setInterval(() => {
        if (!hasPendingOperations()) {
          setIsLoading(false)
          clearInterval(checkLoading)
        }
      }, 500)
      return () => clearInterval(checkLoading)
    }
  }, [hasPendingOperations])

  if (!selectedVideoItem) return null

  const track = tracks[selectedVideoItem.trackIndex]
  const item = track?.items.find((item: any) => item.id === selectedVideoItem.itemId) as VideoItem | undefined
  if (!item) return null

  const renderOption = item.renderOption || 'default'

  return (
    <div>
      <div className="flex flex-col gap-2 p-2 border rounded bg-secondary/5 w-[600px]">
        <div className="bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded mb-1">
          Development Testing
        </div>

        <TrackControls
          tracks={tracks}
          selectedTrackIndex={selectedTrackIndex}
          setSelectedTrackIndex={setSelectedTrackIndex}
          isLoading={isLoading}
          createTrack={() => {
            const trackName = `Track ${tracks.length + 1}`
            const newTrackIndex = createTrack(trackName)
            setSelectedTrackIndex(newTrackIndex)
          }}
          addVideoClip={addVideoClip}
          addAudioClip={addAudioClip}
          addClipToBeginning={addClipToBeginning}
          addClipToEnd={addClipToEnd}
          hasPendingOperations={hasPendingOperations}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm">Render Style:</span>
          <select
            className="p-1 border rounded bg-background text-sm"
            value={renderOption}
            onChange={e => {
              const newRenderOption = e.target.value as 'default' | 'contain-blur' | 'cover'
              handleVideoRenderOptionChange(selectedVideoItem.itemId, newRenderOption)
            }}
          >
            <option value="default">Default</option>
            <option value="contain-blur">Contain with Blur</option>
            <option value="cover">Cover</option>
          </select>
        </div>

        {renderOption === 'cover' && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm w-24">Horizontal:</span>
              <input
                type="range"
                min="-100"
                max="100"
                value={positionX}
                onChange={e => {
                  const newValue = parseInt(e.target.value)
                  setPositionX(newValue)
                  handleVideoPositionChange(selectedVideoItem.itemId, newValue, positionY)
                }}
                className="flex-1"
              />
              <span className="text-xs w-8 text-right">{positionX}</span>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPositionX(0)
                  setPositionY(0)
                  handleVideoPositionChange(selectedVideoItem.itemId, 0, 0)
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
