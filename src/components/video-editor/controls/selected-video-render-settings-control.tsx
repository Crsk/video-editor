import { FC, useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Slider } from '~/components/ui/slider'
import { RotateCcw, SettingsIcon, Trash2Icon, Volume2Icon, ScissorsIcon } from 'lucide-react'
import { useEditor } from '../context/video-editor-provider'
import { VideoClip } from '../types'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'
import { Button } from '~/components/ui/button'
import { useTrackManager } from '../hooks/use-track-manager'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { useVolumeControl } from '../hooks/use-volume-control'
import { useEvents } from '../hooks/use-events'

export const SelectedVideoRenderSettingsControl: FC = () => {
  const { tracks, handleDeleteClip } = useEditor()
  const { timelineState } = useRemotionTimeline()
  const { setVideoRenderOption, setVideoPosition, setVideoZoom, splitClip } = useTrackManager()
  const { getSelectedClip, updateVolume } = useVolumeControl()
  const [isOpen, setIsOpen] = useState(false)
  const { selectedClip } = timelineState

  const [positionX, setPositionX] = useState(0)
  const [positionY, setPositionY] = useState(0)
  const [zoom, setZoom] = useState(0)
  const [volume, setVolume] = useState(1)
  const [renderOption, setRenderOption] = useState<'default' | 'contain-blur' | 'cover'>('default')
  const { notifyClipDeleted } = useEvents()

  // Get the selected video clip when the selection changes
  useEffect(() => {
    if (!selectedClip) return

    const { clipIndex, ClipIndex } = selectedClip
    if (clipIndex < 0 || clipIndex >= tracks.length) return

    const track = tracks[clipIndex]
    if (!track || ClipIndex < 0 || ClipIndex >= track.clips.length) return

    const clip = track.clips[ClipIndex]
    if (clip.type !== 'video' && clip.type !== 'audio') return

    // Set volume for all audible clips
    setVolume(clip.volume !== undefined ? clip.volume : 1)

    // Only set video-specific properties for video clips
    if (clip.type === 'video') {
      const videoClip = clip as VideoClip
      setPositionX(videoClip.positionX || 0)
      setPositionY(videoClip.positionY || 0)
      setZoom(videoClip.zoom !== undefined ? videoClip.zoom : 0)
      setRenderOption(videoClip.renderOption || 'default')
    }
  }, [selectedClip, tracks])

  const handleRenderOptionChange = (newRenderOption: 'default' | 'contain-blur' | 'cover') => {
    if (!selectedClip) return

    const { clipIndex, ClipIndex } = selectedClip
    if (clipIndex < 0 || clipIndex >= tracks.length) return

    const track = tracks[clipIndex]
    if (!track || ClipIndex < 0 || ClipIndex >= track.clips.length) return

    const clip = track.clips[ClipIndex]
    if (clip.type !== 'video') return

    setRenderOption(newRenderOption)
    setVideoRenderOption(clip.id, newRenderOption)
  }

  const handlePositionChange = (x: number, y: number) => {
    if (!selectedClip) return

    const { clipIndex, ClipIndex } = selectedClip
    if (clipIndex < 0 || clipIndex >= tracks.length) return

    const track = tracks[clipIndex]
    if (!track || ClipIndex < 0 || ClipIndex >= track.clips.length) return

    const clip = track.clips[ClipIndex]
    if (clip.type !== 'video') return

    setPositionX(x)
    setPositionY(y)
    setVideoPosition(clip.id, x, y)
  }

  const handleZoomChange = (newZoom: number) => {
    if (!selectedClip) return

    const { clipIndex, ClipIndex } = selectedClip
    if (clipIndex < 0 || clipIndex >= tracks.length) return

    const track = tracks[clipIndex]
    if (!track || ClipIndex < 0 || ClipIndex >= track.clips.length) return

    const clip = track.clips[ClipIndex]
    if (clip.type !== 'video') return

    setZoom(newZoom)
    setVideoZoom(clip.id, newZoom)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    updateVolume(newVolume)
  }

  // Only show if a clip is selected
  const audibleClip = getSelectedClip()
  if (!audibleClip) return null

  // Check if the clip is a video for video-specific controls
  const isVideo = audibleClip.type === 'video'

  return (
    <div className="timeline-popover">
      <Button variant="secondary" onClick={() => setIsOpen(!isOpen)} title="Clip Settings">
        <div className="flex items-center gap-2 text-xs">
          <SettingsIcon className="h-4 w-4" /> Clip Settings
        </div>
      </Button>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="sr-only">Open settings</div>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          className="timeline-popover w-auto flex flex-col gap-2 bg-popover-background dark:bg-popover-background/80 backdrop-blur-sm rounded-3xl border-1 overflow-y-auto p-4 items-center"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-3 py-2 px-1">
            {isVideo && (
              <div>
                <h4 className="text-xs font-medium mb-1 text-white/80">Render Style</h4>
                <Select
                  value={renderOption}
                  onValueChange={e => handleRenderOptionChange(e as 'default' | 'contain-blur' | 'cover')}
                  defaultValue={renderOption}
                >
                  <SelectTrigger className="w-full text-white/80 border-1">
                    <SelectValue placeholder="Select a render option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="contain-blur">Contain with Blur</SelectItem>
                    <SelectItem value="cover">Cover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isVideo && (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-medium mb-1 text-white/80">Position</h4>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-16 text-white/80">Zoom:</span>
                    <Slider
                      orientation="horizontal"
                      defaultValue={[zoom]}
                      value={[zoom]}
                      max={400}
                      min={0}
                      step={1}
                      className="w-32"
                      onValueChange={values => handleZoomChange(values[0])}
                      customStyle={{
                        track: {
                          className: 'bg-white/20'
                        },
                        range: {
                          className: 'bg-white'
                        },
                        thumb: {
                          className: 'border-0 bg-white'
                        }
                      }}
                    />
                    <span className="text-xs w-8 text-right text-white/80">{Math.round(zoom / 4)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16 text-white/80">Horizontal:</span>
                  <Slider
                    orientation="horizontal"
                    defaultValue={[positionX]}
                    value={[positionX]}
                    min={-1000}
                    max={1000}
                    step={1}
                    className="w-32"
                    onValueChange={values => handlePositionChange(values[0], positionY)}
                    customStyle={{
                      track: {
                        className: 'bg-white/20'
                      },
                      range: {
                        className: 'bg-white'
                      },
                      thumb: {
                        className: 'border-0 bg-white'
                      }
                    }}
                  />
                  <span className="text-xs w-8 text-right text-white/80">{Math.round(positionX / 10)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16 text-white/80">Vertical:</span>
                  <Slider
                    orientation="horizontal"
                    defaultValue={[positionY]}
                    value={[positionY]}
                    min={-1000}
                    max={1000}
                    step={1}
                    className="w-32"
                    onValueChange={values => handlePositionChange(positionX, values[0])}
                    customStyle={{
                      track: {
                        className: 'bg-white/20'
                      },
                      range: {
                        className: 'bg-white'
                      },
                      thumb: {
                        className: 'border-0 bg-white'
                      }
                    }}
                  />
                  <span className="text-xs w-8 text-right text-white/80">{Math.round(positionY / 10)}</span>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-medium mb-1 mt-4 text-white/80">Volume</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs truncate w-16 text-white/80">{audibleClip.src.split('/').pop()}</span>
                <Volume2Icon className="h-3 w-3 text-white/80" />
                <Slider
                  orientation="horizontal"
                  defaultValue={[volume]}
                  value={[volume]}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-28"
                  onValueChange={values => handleVolumeChange(values[0])}
                  customStyle={{
                    track: {
                      className: 'bg-white/20'
                    },
                    range: {
                      className: 'bg-white'
                    },
                    thumb: {
                      className: 'border-0 bg-white'
                    }
                  }}
                />
                <span className="text-xs w-8 text-right text-white/80">{Math.round(volume * 100)}%</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 pt-4 w-full">
              <Button
                size="sm"
                onClick={() => {
                  if (isVideo) {
                    handlePositionChange(0, 0)
                    handleZoomChange(0)
                  }
                  handleVolumeChange(1)
                }}
                className="text-xs bg-white/95 text-black hover:bg-white hover:text-black w-full"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  if (selectedClip) {
                    const { clipIndex, ClipIndex } = selectedClip
                    const track = tracks[clipIndex]
                    if (track && ClipIndex >= 0 && ClipIndex < track.clips.length) {
                      const clip = track.clips[ClipIndex]
                      splitClip(clipIndex, clip.id)
                    }
                  }
                }}
                className="text-xs bg-white/95 text-black hover:bg-white hover:text-black w-full mb-2"
                title="Split Clip at Current Position"
              >
                <ScissorsIcon className="h-4 w-4" />
                Split Clip
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (selectedClip) {
                    const { clipIndex, ClipIndex } = selectedClip
                    const track = tracks[clipIndex]
                    if (track && ClipIndex >= 0 && ClipIndex < track.clips.length) {
                      handleDeleteClip(clipIndex, ClipIndex)
                      const clipId = track.clips[ClipIndex].id
                      notifyClipDeleted({ trackIndex: clipIndex, clipIndex: ClipIndex, clipId }) // TODO: correct track and clip index names
                    }
                  }
                }}
                className="text-xs bg-white/30 dark:bg-white/10 text-white hover:bg-red-500 dark:hover:bg-red-500 hover:text-white w-full"
                title="Delete Clip"
              >
                <Trash2Icon className="h-4 w-4" />
                Delete Clip
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
