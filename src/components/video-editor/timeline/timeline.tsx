import { TimeRuler } from './time-ruler'
import { TimeMarker } from './time-marker'
import { Track } from './track'
import '../styles/timeline.css'
import { useEditor } from '../context/video-editor-provider'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { FC } from 'react'
import { useRemotionTimeline } from './context/remotion-timeline-context'
import { TimelineStyle } from '../types'
import { cn } from '~/lib/utils'
import { TrackSidePanel } from './track-sidepanel'

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

export const Timeline: FC<{
  styles?: Partial<TimelineStyle>
}> = ({ styles }) => {
  const { tracks, currentTime } = useEditor()
  const { timelineState, timelineInteractions, timelineDnd } = useRemotionTimeline()
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
  const { sensors, activeClip, handleDragStart, handleDragMove, handleDragEnd, modifiers } = timelineDnd

  // Use the original handler from timelineInteractions for clip selection
  const handleClipSelectWithRenderOption = (trackIndex: number, ClipIndex: number) => {
    // Call the original handler from timelineInteractions
    timelineInteractions.handleClipSelect(trackIndex, ClipIndex)
  }

  return (
    <div className={cn('overflow-x-hidden', styles?.root)} data-testid="timeline-root">
      <div className="flex">
        <TrackSidePanel tracks={tracks} className="flex-shrink-0 " />
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          modifiers={modifiers}
          collisionDetection={pointerWithin}
        >
          <div ref={containerRef} className="w-full" data-testid="timeline-container">
            <div
              ref={timelineContainerRef}
              className="overflow-x-hidden timeline-scroll-container relative select-none"
              data-testid="timeline-scroll-container"
              onMouseDown={handleTimelineClick}
            >
              <div style={{ width: totalTimelineWidth, position: 'relative' }}>
                <TimeRuler
                  timeMarkers={timeMarkers}
                  pixelsPerSecond={pixelsPerSecond}
                  videoEndPosition={videoEndPosition}
                  nonPlayableWidth={nonPlayableWidth}
                  hasVideoTracks={tracks.some(track => track.clips.some(clip => clip.type === 'video'))}
                  styles={_styles.timeRuler}
                />

                <TimeMarker
                  currentTime={currentTime}
                  pixelsPerSecond={pixelsPerSecond}
                  isDragging={isDragging}
                  onMarkerDrag={handleMarkerDrag}
                  styles={_styles.timeMarker}
                />

                <div className="mt-2" data-testid="tracks-container">
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
                      onClipSelect={handleClipSelectWithRenderOption}
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
              {activeClip && (
                <div
                  className={cn(activeDragBase, styles?.track?.clip?.active?.dragOrResize)}
                  style={{
                    width: Math.max(4, (activeClip.durationInFrames / FPS) * pixelsPerSecond),
                    borderRadius: '8px',
                    height: '20px'
                  }}
                >
                  {/* <div>{activeClip.type.charAt(0).toUpperCase() + activeClip.type.slice(1)}</div> */}
                </div>
              )}
            </DragOverlay>
          )}
        </DndContext>
      </div>
    </div>
  )
}
