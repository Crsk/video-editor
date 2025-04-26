import { FC, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Slider } from '~/components/ui/slider'
import { Volume1Icon, Volume2Icon, VolumeIcon, VolumeXIcon } from 'lucide-react'

interface VolumeControlProps {
  initialVolume: number
  onVolumeChange: (volume: number) => void
}

export const VolumeControl: FC<VolumeControlProps> = ({ initialVolume, onVolumeChange }) => {
  const [volume, setVolume] = useState(initialVolume)
  const [isOpen, setIsOpen] = useState(false)

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0]
    setVolume(newVolume)
    onVolumeChange(newVolume)
  }

  const Volume = ({ volume }: { volume: number }) => {
    if (volume === 0) return <VolumeXIcon className="h-4 w-4" />
    else if (volume < 0.2) return <VolumeIcon className="h-4 w-4" />
    else if (volume <= 0.8) return <Volume1Icon className="h-4 w-4" />
    else if (volume > 0.8) return <Volume2Icon className="h-4 w-4" />
    return <Volume2Icon className="h-4 w-4" />
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="h-6 w-6 rounded-full" onClick={() => setIsOpen(!isOpen)}>
        <Volume volume={volume} />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        className="w-32 p-4 flex items-center justify-center bg-light-blue rounded-[12px] border-0"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Slider
          orientation="horizontal"
          defaultValue={[volume]}
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          customStyle={{
            track: {
              className: 'bg-white/20'
            },
            range: {
              className: 'bg-black'
            },
            thumb: {
              className: 'border-0'
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
