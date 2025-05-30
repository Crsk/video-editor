import { useCallback, useMemo } from 'react'
import { CaptionAnimationType } from './types/caption.types'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { MoreVerticalIcon } from 'lucide-react'
import { useCaptionAnimationContext } from './context/caption-animation-provider'
import { useCaptionTrackManager } from './captions/hooks/use-caption-track-manager'
import { useCaptionVTT } from './captions/hooks/use-caption-vtt'
import { useTranscript } from './context/transcript-context'

const ANIMATION_OPTIONS: Array<{ value: CaptionAnimationType; label: string; description: string }> = [
  {
    value: 'bounce',
    label: 'Bounce',
    description: 'Classic bounce entrance with smooth scaling'
  },
  {
    value: 'wave',
    label: 'Wave',
    description: 'Waves with dynamic scale and rotation based on duration'
  },
  {
    value: 'shake',
    label: 'Shake',
    description: 'High-frequency trembling effect with subtle rotation'
  },
  {
    value: 'zoom',
    label: 'Zoom',
    description: 'Dramatic zoom from tiny to large with spring physics'
  },
  {
    value: 'swing',
    label: 'Swing',
    description: 'Pendulum swing motion with dampening over time'
  },
  {
    value: 'elastic',
    label: 'Elastic',
    description: 'Overshoot entrance with elastic bounce settlement'
  },
  {
    value: 'glitch',
    label: 'Glitch',
    description: 'Chaos and mega distortions'
  }
]

export const CaptionsSettings = () => {
  const { replaceAllCaptionTracks } = useCaptionTrackManager()
  const { downloadVTT } = useCaptionVTT()
  const { animationType, setAnimationType } = useCaptionAnimationContext()
  const currentAnimationOption = ANIMATION_OPTIONS.find(option => option.value === animationType)
  const { text } = useTranscript()
  const captionsAvailable = useMemo(() => text.length > 0, [text])
  const handleCreateCaptionTrack = useCallback(() => {
    if (text.length === 0) {
      console.warn('No transcript available to create captions')
      return
    }

    const words = text.map(word => ({
      word: word.word,
      start: word.start,
      end: word.end
    }))

    replaceAllCaptionTracks(words)
  }, [text, replaceAllCaptionTracks])

  const handleDownloadVTT = useCallback(() => {
    if (text.length === 0) {
      console.warn('No transcript available to download VTT')
      return
    }

    const words = text.map(word => ({
      word: word.word,
      start: word.start,
      end: word.end
    }))

    downloadVTT(words, 'captions.vtt')
  }, [text, downloadVTT])

  return (
    <>
      {captionsAvailable && (
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full">
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuItem onClick={handleCreateCaptionTrack}>Add Captions</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Animation</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {ANIMATION_OPTIONS.map(option => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={currentAnimationOption?.value === option.value}
                        onCheckedChange={() => setAnimationType(option.value)}
                      >
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={handleDownloadVTT} disabled={!captionsAvailable}>
                Download Captions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  )
}
