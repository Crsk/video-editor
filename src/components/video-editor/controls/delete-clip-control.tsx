import { FC, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { Trash2Icon } from 'lucide-react'
import { useEditor } from '~/components/video-editor/context/video-editor-provider'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'

export const DeleteClipControl: FC = () => {
  const { tracks, handleDeleteItem } = useEditor()
  const { timelineState } = useRemotionTimeline()
  const { selectedClip, setSelectedClip } = timelineState

  const handleDeleteClip = useCallback(() => {
    if (!selectedClip) return

    const { clipIndex, itemIndex } = selectedClip

    // Use the context's delete function
    handleDeleteItem(clipIndex, itemIndex)

    // Deselect the clip after deletion
    setSelectedClip(null)
  }, [selectedClip, handleDeleteItem, setSelectedClip])

  if (!selectedClip || selectedClip.clipIndex === undefined || selectedClip.itemIndex === undefined) {
    return null
  }

  // Make sure the selected clip actually exists
  const clipExists =
    tracks[selectedClip.clipIndex] &&
    tracks[selectedClip.clipIndex].items &&
    tracks[selectedClip.clipIndex].items[selectedClip.itemIndex]

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
          handleDeleteClip()
        }}
        title="Delete clip"
      >
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </div>
  )
}
