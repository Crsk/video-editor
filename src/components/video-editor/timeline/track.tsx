import { FC } from 'react'
import { Track as TrackType } from '../types'
import { TrackItem } from './track-item'
import { useDroppable } from '@dnd-kit/core'

interface TrackProps {
  track: TrackType
  trackIndex: number
  pixelsPerSecond: number
  videoEndPosition: number
  nonPlayableWidth: number
  selectedItem: { trackIndex: number; itemIndex: number } | null
  originalVideoDuration: number
  onItemSelect: (trackIndex: number, itemIndex: number) => void
  onResizeStart: (e: React.MouseEvent, mode: 'left' | 'right') => void
  trackRef?: (el: HTMLDivElement | null) => void
}

export const Track: FC<TrackProps> = ({
  track,
  trackIndex,
  pixelsPerSecond,
  videoEndPosition,
  selectedItem,
  originalVideoDuration,
  onItemSelect,
  onResizeStart,
  trackRef
}) => {
  // Setup droppable with dnd-kit
  const { setNodeRef, isOver } = useDroppable({
    id: `track-${trackIndex}`,
    data: {
      trackIndex,
      type: 'track'
    }
  })

  return (
    <div className="flex items-center mb-2" ref={trackRef}>
      <div
        ref={setNodeRef}
        className={`relative h-8 pt-0 cursor-pointer ${isOver ? 'bg-muted/80' : 'bg-muted'}`}
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
            selectedItem !== null && selectedItem.trackIndex === trackIndex && selectedItem.itemIndex === itemIndex

          const isResizable = item.type === 'video' || item.type === 'audio'
          const showResizeControls = isSelected && isResizable
          const maxDurationSeconds = item.type === 'video' ? originalVideoDuration : Infinity

          return (
            <TrackItem
              key={item.id}
              item={item}
              trackIndex={trackIndex}
              itemIndex={itemIndex}
              pixelsPerSecond={pixelsPerSecond}
              isSelected={isSelected}
              showResizeControls={showResizeControls}
              maxDurationSeconds={maxDurationSeconds}
              onItemSelect={onItemSelect}
              onResizeStart={onResizeStart}
              videoEndPosition={videoEndPosition}
            />
          )
        })}
      </div>
    </div>
  )
}
