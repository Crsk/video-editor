import { TimeRuler } from './time-ruler'
import { TimeMarker } from './time-marker'
import { Track } from './track'
import '../styles/timeline.css'
import { useEditor } from '../context/video-editor-context'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { FC, useRef, useState, useEffect } from 'react'
import { useRemotionTimeline } from './context/remotion-timeline-context'
import { VideoComposer } from './video-composer'
import { TimelineStyle, VideoItem } from '../types'
import { cn } from '~/lib/utils'
import { useTrackManager } from '../hooks/use-track-manager'
import { Button } from '~/components/ui/button'

const activeDragBase =
  'flex items-center justify-center h-7 rounded text-accent text-xs overflow-hidden truncate whitespace-nowrap bg-timeline-accent opacity-80 border-0 select-none dark:text-primary/40'

const defaultTimelineStyle: TimelineStyle = {
  root: '',
  timeMarker: {
    line: '',
    handle: ''
  },
  timeRuler: {
    root: '',
    gridLines: '',
    label: ''
  },
  track: {
    root: '',
    clip: {
      root: '',
      content: '',
      active: {
        root: '',
        resizeHandle: '',
        content: '',
        dragOrResize: ''
      }
    }
  }
}

export const Timeline: FC<{ styles?: Partial<TimelineStyle> }> = ({ styles }) => {
  const { tracks, currentTime, handleVideoRenderOptionChange, handleVideoPositionChange } = useEditor()
  const { timelineState, timelineInteractions, timelineDnd } = useRemotionTimeline()
  const { createTrack, addVideoClip, addAudioClip, addClipToBeginning, addClipToEnd, hasPendingOperations } =
    useTrackManager()
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null)
  const [selectedVideoItem, setSelectedVideoItem] = useState<{ trackIndex: number; itemId: string } | null>(null)
  const [positionX, setPositionX] = useState(0)
  const [positionY, setPositionY] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const _styles: TimelineStyle = {
    ...defaultTimelineStyle,
    ...styles
  }

  const {
    containerRef,
    timelineContainerRef,
    trackRefs,
    timeMarkers,
    totalTimelineWidth,
    videoEndPosition,
    nonPlayableWidth,
    pixelsPerSecond,
    selectedClip,
    isDragging,
    resizeMode,
    resizeOverlay,
    FPS
  } = timelineState

  const { handleTimelineClick, handleMarkerDrag, handleResizeStart } = timelineInteractions
  const { sensors, activeItem, handleDragStart, handleDragMove, handleDragEnd, modifiers } = timelineDnd

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || selectedTrackIndex === null) return

    setIsLoading(true)
    const fileUrl = URL.createObjectURL(file)

    addVideoClip(selectedTrackIndex, fileUrl)

    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }

    const checkLoading = setInterval(() => {
      if (!hasPendingOperations()) {
        setIsLoading(false)
        clearInterval(checkLoading)
      }
    }, 500)
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || selectedTrackIndex === null) return

    setIsLoading(true)
    const fileUrl = URL.createObjectURL(file)

    addAudioClip(selectedTrackIndex, fileUrl)

    if (audioInputRef.current) audioInputRef.current.value = ''

    const checkLoading = setInterval(() => {
      if (!hasPendingOperations()) {
        setIsLoading(false)
        clearInterval(checkLoading)
      }
    }, 500)
  }

  const handleCreateTrack = () => {
    const trackName = `Track ${tracks.length + 1}`
    const newTrackIndex = createTrack(trackName)
    setSelectedTrackIndex(newTrackIndex)
  }

  // Custom handler for item selection that also updates selectedVideoItem
  const handleItemSelectWithRenderOption = (trackIndex: number, itemIndex: number) => {
    // Call the original handler from timelineInteractions
    timelineInteractions.handleItemSelect(trackIndex, itemIndex)

    // Set the selected video item if it's a video
    const item = tracks[trackIndex]?.items[itemIndex]
    if (item && item.type === 'video') {
      setSelectedVideoItem({ trackIndex, itemId: item.id })
      // Set initial position values from the item
      setPositionX(item.positionX || 0)
      setPositionY(item.positionY || 0)
    } else {
      setSelectedVideoItem(null)
    }
  }

  // Update position values when selected item changes
  useEffect(() => {
    if (selectedVideoItem) {
      const track = tracks[selectedVideoItem.trackIndex]
      const item = track?.items.find(item => item.id === selectedVideoItem.itemId) as VideoItem | undefined
      if (item) {
        setPositionX(item.positionX || 0)
        setPositionY(item.positionY || 0)
      }
    }
  }, [selectedVideoItem, tracks])

  return (
    <div>
      {/* Track management controls */}
      <div className="flex items-center gap-2 mb-4 p-2 bg-secondary/10 rounded">
        <Button onClick={handleCreateTrack} variant="outline" size="sm">
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
                setIsLoading(true)
                addClipToBeginning(selectedTrackIndex, sampleVideoUrl, 'video')

                const checkLoading = setInterval(() => {
                  if (!hasPendingOperations()) {
                    setIsLoading(false)
                    clearInterval(checkLoading)
                  }
                }, 500)
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
                setIsLoading(true)
                addClipToEnd(selectedTrackIndex, sampleVideoUrl, 'video')

                const checkLoading = setInterval(() => {
                  if (!hasPendingOperations()) {
                    setIsLoading(false)
                    clearInterval(checkLoading)
                  }
                }, 500)
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

        {/* Render option select for video items */}
        {selectedVideoItem && (
          <div className="flex flex-col gap-2 ml-4 p-2 border rounded bg-secondary/5">
            <div className="flex items-center gap-2">
              <span className="text-sm">Render Style:</span>
              <select
                className="p-1 border rounded bg-background text-sm"
                value={(() => {
                  const track = tracks[selectedVideoItem.trackIndex]
                  const item = track?.items.find(item => item.id === selectedVideoItem.itemId) as VideoItem | undefined
                  return item?.renderOption || 'default'
                })()}
                onChange={e => {
                  const renderOption = e.target.value as 'default' | 'contain-blur' | 'cover'
                  handleVideoRenderOptionChange(selectedVideoItem.itemId, renderOption)
                }}
              >
                <option value="default">Default</option>
                <option value="contain-blur">Contain with Blur</option>
                <option value="cover">Cover</option>
              </select>
            </div>

            {/* Position sliders for cover mode */}
            {(() => {
              const track = tracks[selectedVideoItem.trackIndex]
              const item = track?.items.find(item => item.id === selectedVideoItem.itemId) as VideoItem | undefined
              return item?.renderOption === 'cover' ? (
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
              ) : null
            })()}
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        modifiers={modifiers}
        collisionDetection={pointerWithin}
      >
        <div ref={containerRef} className={styles?.root}>
          <div
            ref={timelineContainerRef}
            className="overflow-x-auto timeline-scroll-container relative select-none"
            onMouseDown={handleTimelineClick}
          >
            <div style={{ width: totalTimelineWidth, position: 'relative' }}>
              <TimeRuler
                timeMarkers={timeMarkers}
                pixelsPerSecond={pixelsPerSecond}
                videoEndPosition={videoEndPosition}
                nonPlayableWidth={nonPlayableWidth}
                hasVideoTracks={tracks.some(track => track.items.some(item => item.type === 'video'))}
                styles={_styles.timeRuler}
              />

              <TimeMarker
                currentTime={currentTime}
                pixelsPerSecond={pixelsPerSecond}
                isDragging={isDragging}
                onMarkerDrag={handleMarkerDrag}
                styles={_styles.timeMarker}
              />

              <div className="mt-2">
                {tracks.map((track, clipIndex) => (
                  <Track
                    key={`clip-${clipIndex}`}
                    track={track}
                    clipIndex={clipIndex}
                    pixelsPerSecond={pixelsPerSecond}
                    videoEndPosition={videoEndPosition}
                    nonPlayableWidth={nonPlayableWidth}
                    selectedClip={selectedClip}
                    originalVideoDuration={timelineState.originalVideoDurationInSeconds}
                    onItemSelect={handleItemSelectWithRenderOption}
                    onResizeStart={handleResizeStart}
                    trackRef={el => (trackRefs.current[clipIndex] = el)}
                    styles={_styles.track}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        {resizeMode && resizeOverlay && (
          <div
            className={cn(
              'pointer-events-none fixed z-[100]',
              activeDragBase,
              styles?.track?.clip?.active?.dragOrResize
            )}
            style={{
              left: resizeOverlay.left,
              top: resizeOverlay.top,
              width: resizeOverlay.width,
              height: resizeOverlay.height,
              opacity: 0.2,
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="text-secondary/40 dark:text-primary/40 text-xs truncate whitespace-nowrap">
              {resizeOverlay.label}
            </div>
          </div>
        )}
        {!resizeMode && (
          <DragOverlay transition="0s" style={{ opacity: 0.2 }}>
            {activeItem && (
              <div
                className={cn(activeDragBase, styles?.track?.clip?.active?.dragOrResize)}
                style={{
                  width: Math.max(4, (activeItem.durationInFrames / FPS) * pixelsPerSecond),
                  borderRadius: '100px'
                }}
              >
                {/* <div>{activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)}</div> */}
              </div>
            )}
          </DragOverlay>
        )}
      </DndContext>

      <VideoComposer />
    </div>
  )
}
