import { TimelineControls } from './timeline-controls'
import { TimeRuler } from './time-ruler'
import { TimeMarker } from './time-marker'
import { Track } from './track'
import '../styles/timeline.css'
import { useEditor } from '../context/editor-context'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { FC, useMemo } from 'react'

import { RemotionTimelineProvider } from './context/remotion-timeline-context'
import { useRemotionTimeline } from './context/remotion-timeline-context'
import { VideoComposer } from './video-composer'
import { staticFile } from 'remotion'

const TimelineComponent: FC = () => (
  <RemotionTimelineProvider>
    <TimelineInner />
  </RemotionTimelineProvider>
)

// Create the Timeline namespace with all components
export const Timeline = TimelineComponent

const TimelineInner: FC = () => {
  const { tracks, currentTime, isPlaying, isLooping, durationInFrames, togglePlayPause, toggleLoop } = useEditor()
  const { timelineState, timelineInteractions, timelineDnd } = useRemotionTimeline()

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
    zoomIn,
    zoomOut,
    timeMarkers,
    totalTimelineWidth,
    videoEndPosition,
    nonPlayableWidth,
    pixelsPerSecond,
    selectedItem,
    isDragging,
    resizeMode,
    resizeOverlay,
    zoomLevelIndex,
    originalVideoDurationInSeconds,
    FPS
  } = timelineState

  const { handleTimelineClick, handleMarkerDrag, handleItemSelect, handleResizeStart } = timelineInteractions
  const { sensors, activeItem, handleDragStart, handleDragMove, handleDragEnd, modifiers } = timelineDnd
  const durationInSeconds = durationInFrames / FPS

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
        <div ref={containerRef} className="bg-background p-4 rounded-lg mt-6">
          <TimelineControls
            currentTime={currentTime}
            durationInSeconds={durationInSeconds}
            isPlaying={isPlaying}
            isLooping={isLooping}
            onPlayPause={togglePlayPause}
            onLoopToggle={toggleLoop}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            zoomLevelIndex={zoomLevelIndex}
            maxZoomLevel={20}
          />
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
              />

              <TimeMarker
                currentTime={currentTime}
                pixelsPerSecond={pixelsPerSecond}
                isDragging={isDragging}
                onMarkerDrag={handleMarkerDrag}
              />

              <div className="mt-2">
                {tracks.map((track, trackIndex) => (
                  <Track
                    key={`track-${trackIndex}`}
                    track={track}
                    trackIndex={trackIndex}
                    pixelsPerSecond={pixelsPerSecond}
                    videoEndPosition={videoEndPosition}
                    nonPlayableWidth={nonPlayableWidth}
                    selectedItem={selectedItem}
                    originalVideoDuration={originalVideoDurationInSeconds}
                    onItemSelect={handleItemSelect}
                    onResizeStart={handleResizeStart}
                    trackRef={el => (trackRefs.current[trackIndex] = el)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        {resizeMode && resizeOverlay && (
          <div
            className="pointer-events-none fixed z-[100]"
            style={{
              left: resizeOverlay.left,
              top: resizeOverlay.top,
              width: resizeOverlay.width,
              height: resizeOverlay.height,
              opacity: 0.2,
              borderRadius: '8px',
              background: 'var(--color-timeline-accent)',
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
                className="flex items-center justify-center h-7 rounded text-accent text-xs overflow-hidden truncate whitespace-nowrap bg-timeline-accent opacity-80 border-0 select-none"
                style={{
                  width: Math.max(4, (activeItem.durationInFrames / FPS) * pixelsPerSecond),
                  borderRadius: '100px'
                }}
              >
                <div className="text-secondary/40 dark:text-primary/40">
                  {activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)}
                </div>
              </div>
            )}
          </DragOverlay>
        )}
      </DndContext>

      <VideoComposer timelineData={ffmpegData} />
    </div>
  )
}
