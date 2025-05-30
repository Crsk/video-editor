import { FC } from 'react'
import { ClipStyle, Clip as ClipType, CaptionClip } from '../types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatTimeCode } from '../utils/format-time'
import { useDraggable } from '@dnd-kit/core'
import { AudioTrackVisualizer } from './audio-track-visualizer'
import { cn } from '~/lib/utils'

const FPS = 30

const CaptionContent: FC<{ clip: CaptionClip; clipWidth: number }> = ({ clip, clipWidth }) => {
  const text = clip.text

  if (clipWidth < 40) return <div title={text}></div>

  if (clipWidth < 80) {
    const maxChars = Math.floor(clipWidth / 8) - 1 // Rough estimate of character width
    const shortText = maxChars > 0 ? text.substring(0, Math.max(1, maxChars)) : text.charAt(0)

    return (
      <div
        className="text-foreground text-xs w-full flex pl-3"
        style={{
          overflow: 'hidden',
          fontSize: '10px',
          lineHeight: '1'
        }}
        title={text}
      >
        {shortText}
        {maxChars < text.length ? '…' : ''}
      </div>
    )
  }

  if (clipWidth < 120) {
    const words = text.split(' ')
    const maxChars = Math.floor(clipWidth / 6) - 3

    let displayText = ''
    for (const word of words) {
      if ((displayText + word).length <= maxChars) displayText += (displayText ? ' ' : '') + word
      else break
    }

    if (!displayText && words[0]) displayText = words[0].substring(0, Math.max(1, maxChars))

    return (
      <div
        className="text-foreground text-xs w-full pl-3 text-center"
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '11px'
        }}
        title={text}
      >
        {displayText}
        {displayText.length < text.length ? '…' : ''}
      </div>
    )
  }

  return (
    <div
      className="text-foreground text-xs w-full pl-2 text-center"
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
      title={text}
    >
      {text}
    </div>
  )
}

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
    borderRadius: '8px'
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        `absolute flex items-center h-5 mt-[6.5px] text-accent text-xs cursor-grab ${
          clip.type === 'audio' ? '' : clip.type === 'caption' ? 'bg-subtle-xl' : 'bg-clip-background'
        } timeline-clip opacity-80 border-0 select-none`,
        styles?.root,
        isSelected ? (styles?.active.root !== '' ? styles?.active.root : 'bg-[var(--color-timeline-accent)]') : ''
      )}
      data-testid={`clip-${clipIndex}-${ClipIndex}`}
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
            'absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-ew-resize z-40 resize-handle text-secondary',
            styles?.active.resizeHandle
          )}
          data-testid={`clip-resize-left-${clipIndex}-${ClipIndex}`}
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
          'flex-1 flex items-center justify-center text-secondary min-w-0',
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
            <AudioTrackVisualizer src={clip.src} color={isSelected ? '#ffffff80' : 'var(--color-ring)'} height={26} />
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
        ) : clip.type === 'caption' ? (
          <CaptionContent clip={clip as CaptionClip} clipWidth={ClipDurationSeconds * pixelsPerSecond} />
        ) : (
          ''
        )}
      </div>

      {/* Right resize handle for video clips */}
      {showResizeControls && (
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-ew-resize z-40 resize-handle text-secondary',
            styles?.active.resizeHandle
          )}
          data-testid={`clip-resize-right-${clipIndex}-${ClipIndex}`}
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
