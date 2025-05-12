import { FC } from 'react'
import { TrackStyle, Track as TrackType } from '../types'
import { Clip } from './clip'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '~/lib/utils'
import { useRemotionTimeline } from './context/remotion-timeline-context'
import { UploadButton } from './upload-button'
import { useMediaUpload } from '../hooks/use-media-upload'

interface TrackProps {
  track: TrackType
  clipIndex: number
  pixelsPerSecond: number
  videoEndPosition: number
  nonPlayableWidth: number
  selectedClip: { clipIndex: number; ClipIndex: number } | null
  originalVideoDuration: number
  onClipSelect: (clipIndex: number, ClipIndex: number) => void
  onResizeStart: (e: React.MouseEvent, mode: 'left' | 'right') => void
  trackRef?: (el: HTMLDivElement | null) => void
  styles?: TrackStyle
}

export const Track: FC<TrackProps> = ({
  track,
  clipIndex,
  pixelsPerSecond,
  videoEndPosition,
  nonPlayableWidth,
  selectedClip,
  /* originalVideoDuration, */
  onClipSelect,
  onResizeStart,
  trackRef,
  styles
}) => {
  // Setup droppable with dnd-kit
  const { setNodeRef, isOver } = useDroppable({
    id: `track-${clipIndex}`,
    data: {
      clipIndex,
      type: 'track'
    }
  })

  const { timelineState } = useRemotionTimeline()
  const { resizeMode, resizeOverlay } = timelineState
  const { getUploadButtonPosition } = useMediaUpload()

  return (
    <div className={cn('flex items-center mb-2', styles?.root)} ref={trackRef} data-testid={`track-${clipIndex}`}>
      <div
        ref={setNodeRef}
        className={cn('relative h-8 cursor-pointer', isOver ? 'bg-muted/80' : 'bg-transparent', styles?.root)}
        style={{ width: '100%' }}
      >
        {/* Overlay for non-playable regions on tracks */}
        {videoEndPosition > 0 && (
          <div
            className="absolute top-0 bottom-0 bg-background/85 z-20"
            style={{
              left: videoEndPosition,
              width: nonPlayableWidth
            }}
          />
        )}

        {track.clips.map((clip, ClipIndex) => {
          const isSelected =
            selectedClip !== null && selectedClip.clipIndex === clipIndex && selectedClip.ClipIndex === ClipIndex

          const isResizable = clip.type === 'video' || clip.type === 'audio'
          const showResizeControls = isSelected && isResizable
          // const maxDurationSeconds = clip.type === 'video' ? originalVideoDuration : Infinity
          const maxDurationSeconds = Infinity
          const isResizing = resizeMode && resizeOverlay

          return (
            !(isResizing && isSelected) && (
              <Clip
                key={clip.id}
                clip={clip}
                clipIndex={clipIndex}
                ClipIndex={ClipIndex}
                pixelsPerSecond={pixelsPerSecond}
                isSelected={isSelected}
                showResizeControls={showResizeControls}
                maxDurationSeconds={maxDurationSeconds}
                onClipSelect={onClipSelect}
                onResizeStart={onResizeStart}
                videoEndPosition={videoEndPosition}
                styles={styles?.clip}
              />
            )
          )
        })}

        <div
          className="absolute"
          style={{
            left: getUploadButtonPosition(track, pixelsPerSecond, videoEndPosition),
            top: 4,
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 20
          }}
        >
          <UploadButton trackIndex={clipIndex} />
        </div>
      </div>
    </div>
  )
}
