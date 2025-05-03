import { FC, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Slider } from '~/components/ui/slider'
import { Volume2Icon } from 'lucide-react'
import { useEditor } from '../context/video-editor-provider'
import { AudibleClip } from '../types'
import { useRemotionTimeline } from './context/remotion-timeline-context'
import { Button } from '~/components/ui/button'

interface AudioClipVolumeProps {
  clip: AudibleClip
  onVolumeChange: (ClipId: string, volume: number) => void
}

const AudioClipVolume: FC<AudioClipVolumeProps> = ({ clip, onVolumeChange }) => {
  const [volume, setVolume] = useState(clip.volume ?? 1)

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0]
    setVolume(newVolume)
    onVolumeChange(clip.id, newVolume)
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="w-24 truncate text-xs text-white/80">{clip.src.split('/').pop()}</div>
      <Slider
        orientation="horizontal"
        defaultValue={[volume]}
        value={[volume]}
        max={1}
        step={0.01}
        className="w-24"
        onValueChange={handleVolumeChange}
        customStyle={{
          track: {
            className: 'bg-white/20'
          },
          range: {
            className: 'bg-white'
          },
          thumb: {
            className: 'border-0 bg-white'
          }
        }}
      />
    </div>
  )
}

export const TimelineVolumeControl: FC = () => {
  const { tracks, handleAudioClipVolumeChange } = useEditor()
  const { timelineState } = useRemotionTimeline()
  const [isOpen, setIsOpen] = useState(false)
  const selectedClip = timelineState.selectedClip

  if (!selectedClip) return null

  if (!tracks[selectedClip.clipIndex] || !tracks[selectedClip.clipIndex].clips[selectedClip.ClipIndex]) return null

  const _selectedClip = tracks[selectedClip.clipIndex].clips[selectedClip.ClipIndex]
  const isAudible = _selectedClip.type === 'audio' || _selectedClip.type === 'video'

  if (!isAudible) return null

  return (
    <div className="timeline-popover">
      <Button variant="secondary" size="icon" onClick={() => setIsOpen(!isOpen)}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger
            asChild
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
            }}
          >
            <Volume2Icon className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="start"
            className="timeline-popover w-auto p-3 flex flex-col gap-2 bg-light-blue rounded-[12px] border-0 max-h-80 overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <AudioClipVolume
                key={_selectedClip.id}
                clip={_selectedClip as AudibleClip}
                onVolumeChange={handleAudioClipVolumeChange}
              />
            </div>
          </PopoverContent>
        </Popover>
      </Button>
    </div>
  )
}
