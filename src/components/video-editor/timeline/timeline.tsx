import { TimeRuler } from './time-ruler'
import { TimeMarker } from './time-marker'
import { Track } from './track'
import '../styles/timeline.css'
import { useEditor } from '../context/editor-context'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { FC, useMemo } from 'react'
import { useRemotionTimeline } from './context/remotion-timeline-context'
import { VideoComposer } from './video-composer'
import { TimelineStyle } from '../types'
import { cn } from '~/lib/utils'

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
  const { tracks, currentTime, durationInFrames } = useEditor()
  const { timelineState, timelineInteractions, timelineDnd } = useRemotionTimeline()
  const _styles: TimelineStyle = {
    ...defaultTimelineStyle,
    ...styles
  }

  const ffmpegData = useMemo(
    () => ({
      composition: {
        durationInFrames,
        fps: timelineState.FPS
      },
      tracks: tracks
        .filter(track => track.items.length > 0)
        .map(track => ({
          name: track.name,
          volume: track.volume || 1,
          items: track.items
            .filter(x => x.type === 'video' || x.type === 'audio')
            .map(item => ({
              id: item.id,
              type: item.type,
              from: item.from,
              durationInFrames: item.durationInFrames,
              src: item.src.split('/').pop()!,
              volume: item.volume || 1
            }))
        })),
      currentTime: currentTime
    }),
    [durationInFrames, timelineState.FPS, tracks, currentTime]
  )

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

  return (
    <div>
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

      <VideoComposer timelineData={ffmpegData} />
    </div>
  )
}
