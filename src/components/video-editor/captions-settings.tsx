import { useCallback, useMemo } from 'react'
import { CaptionAnimationType, CaptionPosition } from './types/caption.types'
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
import { useCaptionVTT } from './captions/hooks/use-caption-vtt'
import { useTranscript } from './context/transcript-context'

const ANIMATION_OPTIONS: Array<{ value: CaptionAnimationType; label: string; description: string }> = [
  { value: 'subtle', label: 'Subtle', description: 'Subtle zoom-in' },
  { value: 'wave', label: 'Wave', description: 'Wavy spin' },
  { value: 'shake', label: 'Shake', description: 'Quick tremble' },
  { value: 'zoom', label: 'Zoom', description: 'Fast zoom-in' },
  { value: 'swing', label: 'Swing', description: 'Pendulum sway' },
  { value: 'elastic', label: 'Elastic', description: 'Elastic pop' },
  { value: 'glitch', label: 'Glitch', description: 'Distorted chaos' }
]

const POSITION_OPTIONS: Array<{ value: CaptionPosition; label: string }> = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' }
]

export const CaptionsSettings = () => {
  const { downloadVTT } = useCaptionVTT()
  const { animationType, setAnimationType, setPreviewAnimationType, position, setPosition, setPreviewPosition } =
    useCaptionAnimationContext()
  const currentAnimationOption = ANIMATION_OPTIONS.find(option => option.value === animationType)
  const currentPositionOption = POSITION_OPTIONS.find(option => option.value === position)
  const { text } = useTranscript()
  const captionsAvailable = useMemo(() => text.length > 0, [text])

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

  const handleAnimationHover = useCallback(
    (animationType: CaptionAnimationType) => {
      setPreviewAnimationType(animationType)
    },
    [setPreviewAnimationType]
  )

  const handleAnimationHoverEnd = useCallback(() => {
    setPreviewAnimationType(null)
  }, [setPreviewAnimationType])

  const handlePositionHover = useCallback(
    (position: CaptionPosition) => {
      setPreviewPosition(position)
    },
    [setPreviewPosition]
  )

  const handlePositionHoverEnd = useCallback(() => {
    setPreviewPosition(null)
  }, [setPreviewPosition])

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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Position</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {POSITION_OPTIONS.map(option => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={currentPositionOption?.value === option.value}
                        onCheckedChange={() => setPosition(option.value)}
                        onMouseEnter={() => handlePositionHover(option.value)}
                        onMouseLeave={handlePositionHoverEnd}
                        className="cursor-pointer"
                      >
                        <span className="font-medium">{option.label}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Animation</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {ANIMATION_OPTIONS.map(option => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={currentAnimationOption?.value === option.value}
                        onCheckedChange={() => setAnimationType(option.value)}
                        onMouseEnter={() => handleAnimationHover(option.value)}
                        onMouseLeave={handleAnimationHoverEnd}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
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
