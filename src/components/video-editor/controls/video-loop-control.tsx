import { FC } from 'react'
import { RepeatIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { useEditor } from '../context/video-editor-context'

export const VideoLoopControl: FC = () => {
  const { isLooping, toggleLoop } = useEditor()

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggleLoop}
      className="rounded-full"
      title={isLooping ? 'Loop enabled' : 'Loop disabled'}
    >
      {isLooping ? <RepeatIcon className="text-chart-2" /> : <RepeatIcon className="text-muted-foreground" />}
    </Button>
  )
}
