import { FC } from 'react'
import { TrackStyle, Track as TrackType } from '../types'
import { Clip } from './clip'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '~/lib/utils'
import { useRemotionTimeline } from './context/remotion-timeline-context'

interface TrackProps {
  track: TrackType
  clipIndex: number
  pixelsPerSecond: number
  videoEndPosition: number
  nonPlayableWidth: number
  selectedClip: { clipIndex: number; itemIndex: number } | null
  originalVideoDuration: number
  onItemSelect: (clipIndex: number, itemIndex: number) => void
  onResizeStart: (e: React.MouseEvent, mode: 'left' | 'right') => void
  trackRef?: (el: HTMLDivElement | null) => void
  styles?: TrackStyle
}

export const Track: FC<TrackProps> = ({
  track,
  clipIndex,
  pixelsPerSecond,
  videoEndPosition,
  selectedClip,
  originalVideoDuration,
  onItemSelect,
  onResizeStart,
  trackRef,
  styles
}) => {
  // Setup droppable with dnd-kit
  const { setNodeRef, isOver } = useDroppable({
    id: `clip-${clipIndex}`,
    data: {
      clipIndex,
      type: 'clip'
    }
  })

  const { timelineState } = useRemotionTimeline()
  const { resizeMode, resizeOverlay } = timelineState

  return (
    <div className={cn('flex items-center mb-2', styles?.root)} ref={trackRef}>
      <div
        ref={setNodeRef}
        className={cn('relative h-8 pt-0 cursor-pointer', isOver ? 'bg-muted/80' : 'bg-transparent', styles?.root)}
        style={{ width: '100%' }}
      >
        {/* Overlay for non-playable regions on tracks */}
        {videoEndPosition > 0 && (
          <div
            className="absolute top-0 bottom-0 bg-background/90 z-20"
            style={{
              left: videoEndPosition,
              right: 0
            }}
          />
        )}

        {track.items.map((item, itemIndex) => {
          const isSelected =
            selectedClip !== null && selectedClip.clipIndex === clipIndex && selectedClip.itemIndex === itemIndex

          const isResizable = item.type === 'video' || item.type === 'audio'
          const showResizeControls = isSelected && isResizable
          const maxDurationSeconds = item.type === 'video' ? originalVideoDuration : Infinity
          const isResizing = resizeMode && resizeOverlay

          return (
            !(isResizing && isSelected) && (
              <Clip
                key={item.id}
                item={item}
                clipIndex={clipIndex}
                itemIndex={itemIndex}
                pixelsPerSecond={pixelsPerSecond}
                isSelected={isSelected}
                showResizeControls={showResizeControls}
                maxDurationSeconds={maxDurationSeconds}
                onItemSelect={onItemSelect}
                onResizeStart={onResizeStart}
                videoEndPosition={videoEndPosition}
                styles={styles?.clip}
              />
            )
          )
        })}
      </div>
    </div>
  )
}
