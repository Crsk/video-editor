import { FC, useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { useTrackManager } from '../hooks/use-track-manager'
import { useEditor } from '../context/video-editor-provider'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'
import { VideoItem } from '../types'

export const VideoRenderControls: FC = () => {
  const { tracks } = useEditor()
  const { setVideoRenderOption, setVideoPosition } = useTrackManager()
  const { timelineState } = useRemotionTimeline()
  const { selectedClip } = timelineState

  const [positionX, setPositionX] = useState(0)
  const [positionY, setPositionY] = useState(0)
  const [renderOption, setRenderOption] = useState<'default' | 'contain-blur' | 'cover'>('default')

  // Get the selected video item when the selection changes
  useEffect(() => {
    if (!selectedClip) return

    const { clipIndex, itemIndex } = selectedClip
    if (clipIndex < 0 || clipIndex >= tracks.length) return

    const track = tracks[clipIndex]
    if (!track || itemIndex < 0 || itemIndex >= track.items.length) return

    const item = track.items[itemIndex]
    if (item.type !== 'video') return

    const videoItem = item as VideoItem
    setPositionX(videoItem.positionX || 0)
    setPositionY(videoItem.positionY || 0)
    setRenderOption(videoItem.renderOption || 'default')
  }, [selectedClip, tracks])

  const handleRenderOptionChange = (newRenderOption: 'default' | 'contain-blur' | 'cover') => {
    if (!selectedClip) return

    const { clipIndex, itemIndex } = selectedClip
    if (clipIndex < 0 || clipIndex >= tracks.length) return

    const track = tracks[clipIndex]
    if (!track || itemIndex < 0 || itemIndex >= track.items.length) return

    const item = track.items[itemIndex]
    if (item.type !== 'video') return

    setRenderOption(newRenderOption)
    setVideoRenderOption(item.id, newRenderOption)
  }

  const handlePositionChange = (x: number, y: number) => {
    if (!selectedClip) return

    const { clipIndex, itemIndex } = selectedClip
    if (clipIndex < 0 || clipIndex >= tracks.length) return

    const track = tracks[clipIndex]
    if (!track || itemIndex < 0 || itemIndex >= track.items.length) return

    const item = track.items[itemIndex]
    if (item.type !== 'video') return

    setPositionX(x)
    setPositionY(y)
    setVideoPosition(item.id, x, y)
  }

  // Only show controls if a video clip is selected
  if (!selectedClip) return null

  // Check if the selected clip is a video
  const { clipIndex, itemIndex } = selectedClip
  if (clipIndex < 0 || clipIndex >= tracks.length) return null

  const track = tracks[clipIndex]
  if (!track || itemIndex < 0 || itemIndex >= track.items.length) return null

  const item = track.items[itemIndex]
  if (item.type !== 'video') return null

  return (
    <div className="bg-background p-4 rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-4">Video Render Settings</h3>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Render Style:</span>
          <select
            className="p-1 border rounded bg-background text-sm"
            value={renderOption}
            onChange={e => handleRenderOptionChange(e.target.value as 'default' | 'contain-blur' | 'cover')}
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
                onChange={e => handlePositionChange(Number(e.target.value), positionY)}
                className="flex-1"
              />
              <span className="text-xs w-8 text-right">{positionX}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm w-24">Vertical:</span>
              <input
                type="range"
                min="-100"
                max="100"
                value={positionY}
                onChange={e => handlePositionChange(positionX, Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs w-8 text-right">{positionY}</span>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handlePositionChange(0, 0)}>
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
