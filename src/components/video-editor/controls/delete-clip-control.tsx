import { FC, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { Trash2Icon } from 'lucide-react'
import { useEditor } from '~/components/video-editor/context/video-editor-provider'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'

export const DeleteClipControl: FC = () => {
  const { tracks, handleDeleteClip } = useEditor()
  const { timelineState } = useRemotionTimeline()
  const { selectedClip, setSelectedClip } = timelineState

  const _handleDeleteClip = useCallback(() => {
    if (!selectedClip) return

    const { clipIndex, ClipIndex } = selectedClip

    // Use the context's delete function
    handleDeleteClip(clipIndex, ClipIndex)

    // Deselect the clip after deletion
    setSelectedClip(null)
  }, [selectedClip, handleDeleteClip, setSelectedClip])

  if (!selectedClip || selectedClip.clipIndex === undefined || selectedClip.ClipIndex === undefined) {
    return null
  }

  // Make sure the selected clip actually exists
  const clipExists =
    tracks[selectedClip.clipIndex] &&
    tracks[selectedClip.clipIndex].clips &&
    tracks[selectedClip.clipIndex].clips[selectedClip.ClipIndex]

  if (!clipExists) {
    return null
  }

  return (
    <div className="timeline-popover">
      <Button
        variant="destructive"
        size="icon"
        onClick={e => {
          e.stopPropagation()
          _handleDeleteClip()
        }}
        title="Delete clip"
      >
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </div>
  )
}
