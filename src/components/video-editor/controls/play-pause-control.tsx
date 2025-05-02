import { FC } from 'react'
import { Button } from '~/components/ui/button'
import { PauseIcon } from '../icons/pause-icon'
import { PlayIcon } from '../icons/play-icon'
import { useEditor } from '../context/video-editor-provider'

export const PlayPauseControl: FC = () => {
  const { isPlaying, togglePlayPause } = useEditor()

  return (
    <Button variant="secondary" size="icon" onClick={togglePlayPause} className="rounded-full">
      {isPlaying ? <PauseIcon className="text-primary" /> : <PlayIcon className="text-primary" />}
    </Button>
  )
}
