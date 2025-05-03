import { FC } from 'react'
import { ClipStyle, Clip as ClipType } from '../types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatTimeCode } from '../utils/format-time'
import { useDraggable } from '@dnd-kit/core'
import { AudioTrackVisualizer } from './audio-track-visualizer'
import { cn } from '~/lib/utils'

const FPS = 30

interface ClipProps {
  clip: ClipType
  clipIndex: number
  ClipIndex: number
  pixelsPerSecond: number
  isSelected: boolean
  showResizeControls: boolean
  maxDurationSeconds: number
  onClipSelect: (clipIndex: number, ClipIndex: number) => void
  onResizeStart: (e: React.MouseEvent, mode: 'left' | 'right') => void
  videoEndPosition?: number // Position where video content ends
  styles?: ClipStyle
}

export const Clip: FC<ClipProps> = ({
  clip,
  clipIndex,
  ClipIndex,
  pixelsPerSecond,
  isSelected,
  showResizeControls,
  onClipSelect,
  onResizeStart,
  videoEndPosition,
  styles
}) => {
  const ClipStartSeconds = clip.from / FPS
  const ClipDurationSeconds = clip.durationInFrames / FPS
  const leftPosition = ClipStartSeconds * pixelsPerSecond

  // Setup draggable with dnd-kit
  const { listeners, setNodeRef, isDragging } = useDraggable({
    id: `clip-${clip.id}`,
    data: {
      clip,
      clipIndex,
      ClipIndex,
      type: 'clip'
    }
  })

  // Calculate if this audio clip extends beyond video end
  const isAudioExtendingBeyondVideo =
    clip.type === 'audio' &&
    videoEndPosition !== undefined &&
    leftPosition + ClipDurationSeconds * pixelsPerSecond > videoEndPosition

  // Apply transform only when dragging
  const style = {
    left: leftPosition,
    width: Math.max(4, ClipDurationSeconds * pixelsPerSecond),
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 50 : isSelected ? 30 : 10,
    borderRadius: '100px'
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        `absolute flex items-center justify-center h-7 top-0.5 text-accent text-xs cursor-grab overflow-hidden truncate whitespace-nowrap ${
          clip.type === 'audio' ? '' : 'bg-primary'
        } timeline-clip opacity-80 border-0 select-none`,
        styles?.root,
        isSelected ? (styles?.active.root !== '' ? styles?.active.root : 'bg-[var(--color-timeline-accent)]') : ''
      )}
      style={style}
      title={`${clip.type} (${formatTimeCode(ClipStartSeconds)}-${formatTimeCode(
        ClipStartSeconds + ClipDurationSeconds
      )})`}
      onClick={e => {
        e.stopPropagation()
        onClipSelect(clipIndex, ClipIndex)
      }}
      {...listeners}
    >
      {/* Left resize handle for video clips */}
      {showResizeControls && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center bg-blue-500/0 hover:bg-blue-500/50 cursor-ew-resize z-40 resize-handle text-secondary dark:text-primary',
            styles?.active.resizeHandle
          )}
          onMouseDown={e => {
            e.stopPropagation()
            onResizeStart(e, 'left')
          }}
        >
          <ChevronLeft size={16} />
        </div>
      )}

      {/* Clip content */}
      <div
        className={cn(
          'flex-1 text-center text-secondary',
          styles?.content,
          isSelected
            ? styles?.active.content !== ''
              ? styles?.active.content
              : 'text-secondary/40 dark:text-primary/40'
            : ''
        )}
      >
        {clip.type === 'audio' ? (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <AudioTrackVisualizer
              src={clip.src}
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
        ) : (
          ''
        )}
      </div>

      {/* Right resize handle for video clips */}
      {showResizeControls && (
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center bg-blue-500/0 hover:bg-blue-500/50 cursor-ew-resize z-40 resize-handle text-secondary dark:text-primary',
            styles?.active.resizeHandle
          )}
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
