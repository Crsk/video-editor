import { FC } from 'react'
import { Item } from '../types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatTimeCode } from '../utils/format-time'
import { useDraggable } from '@dnd-kit/core'
import { AudioTrackVisualizer } from './audio-track-visualizer'

const FPS = 30

interface TrackItemProps {
  item: Item
  trackIndex: number
  itemIndex: number
  pixelsPerSecond: number
  isSelected: boolean
  showResizeControls: boolean
  maxDurationSeconds: number
  onItemSelect: (trackIndex: number, itemIndex: number) => void
  onResizeStart: (e: React.MouseEvent, mode: 'left' | 'right') => void
  videoEndPosition?: number // Position where video content ends
}

export const TrackItem: FC<TrackItemProps> = ({
  item,
  trackIndex,
  itemIndex,
  pixelsPerSecond,
  isSelected,
  showResizeControls,
  onItemSelect,
  onResizeStart,
  videoEndPosition
}) => {
  const itemStartSeconds = item.from / FPS
  const itemDurationSeconds = item.durationInFrames / FPS
  const leftPosition = itemStartSeconds * pixelsPerSecond

  // Setup draggable with dnd-kit
  const { listeners, setNodeRef, isDragging } = useDraggable({
    id: `item-${item.id}`,
    data: {
      item,
      trackIndex,
      itemIndex,
      type: 'track-item'
    }
  })

  // Calculate if this audio item extends beyond video end
  const isAudioExtendingBeyondVideo =
    item.type === 'audio' &&
    videoEndPosition !== undefined &&
    leftPosition + itemDurationSeconds * pixelsPerSecond > videoEndPosition

  // Apply transform only when dragging
  const style = {
    left: leftPosition,
    width: Math.max(4, itemDurationSeconds * pixelsPerSecond),
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 50 : isSelected ? 30 : 10,
    borderRadius: '100px',
    backgroundColor: isSelected ? 'var(--color-timeline-accent)' : ''
  }

  return (
    <div
      ref={setNodeRef}
      className={`absolute flex items-center justify-center h-7 top-0.5 text-accent text-xs cursor-grab overflow-hidden truncate whitespace-nowrap ${
        item.type === 'audio' ? '' : 'bg-primary'
      } timeline-item opacity-80 border-0 select-none`}
      style={style}
      title={`${item.type} (${formatTimeCode(itemStartSeconds)}-${formatTimeCode(
        itemStartSeconds + itemDurationSeconds
      )})`}
      onClick={e => {
        e.stopPropagation()
        onItemSelect(trackIndex, itemIndex)
      }}
      {...listeners}
    >
      {/* Left resize handle for video items */}
      {showResizeControls && (
        <div
          className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center bg-blue-500/0 hover:bg-blue-500/50 cursor-ew-resize z-40 resize-handle text-secondary dark:text-primary"
          onMouseDown={e => {
            e.stopPropagation()
            onResizeStart(e, 'left')
          }}
        >
          <ChevronLeft size={16} />
        </div>
      )}

      {/* Item content */}
      <div
        className={`flex-1 text-center text-secondary ${isSelected ? 'text-secondary/40 dark:text-primary/40' : ''}`}
      >
        {item.type === 'audio' ? (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <AudioTrackVisualizer
              src={item.src}
              color={isSelected ? '#ffffff80' : 'var(--color-timeline-accent)'}
              height={26}
            />
            {isAudioExtendingBeyondVideo && videoEndPosition !== undefined && (
              <div
                className="absolute top-0 bottom-0 z-10 border-l"
                style={{
                  left: videoEndPosition - leftPosition,
                  right: 0
                }}
              />
            )}
          </div>
        ) : itemDurationSeconds * pixelsPerSecond > 30 ? (
          item.type.charAt(0).toUpperCase() + item.type.slice(1)
        ) : (
          ''
        )}
      </div>

      {/* Right resize handle for video items */}
      {showResizeControls && (
        <div
          className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center bg-blue-500/0 hover:bg-blue-500/50 cursor-ew-resize z-40 resize-handle text-secondary dark:text-primary"
          onMouseDown={e => {
            e.stopPropagation()
            onResizeStart(e, 'right')
          }}
        >
          <ChevronRight size={16} />
        </div>
      )}
    </div>
  )
}
