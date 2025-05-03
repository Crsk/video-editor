import { FC } from 'react'
import { RepeatIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { useEditor } from '../context/video-editor-provider'
import { cn } from '~/lib/utils'

export const VideoLoopControl: FC<{ classNames?: { root?: string; active?: string; inactive?: string } }> = ({
  classNames
}) => {
  const { isLooping, toggleLoop } = useEditor()

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggleLoop}
      className={cn('rounded-full', classNames?.root)}
      title={isLooping ? 'Loop enabled' : 'Loop disabled'}
    >
      {isLooping ? (
        <RepeatIcon className={cn('text-chart-2', classNames?.active)} />
      ) : (
        <RepeatIcon className={cn('text-muted-foreground', classNames?.inactive)} />
      )}
    </Button>
  )
}
