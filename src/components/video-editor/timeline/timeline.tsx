import { TimeRuler } from './time-ruler'
import { TimeMarker } from './time-marker'
import { Track } from './track'
import '../styles/timeline.css'
import { useEditor } from '../context/video-editor-context'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { FC, useRef, useState } from 'react'
import { useRemotionTimeline } from './context/remotion-timeline-context'
import { VideoComposer } from './video-composer'
import { TimelineStyle } from '../types'
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
  const { tracks, currentTime } = useEditor()
  const { timelineState, timelineInteractions, timelineDnd } = useRemotionTimeline()
  const { createTrack, addVideoClip, addAudioClip, addClipToBeginning, addClipToEnd, hasPendingOperations } =
    useTrackManager()
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null)
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

  const { handleTimelineClick, handleMarkerDrag, handleItemSelect, handleResizeStart } = timelineInteractions
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
                    onItemSelect={handleItemSelect}
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
