import { FC, useRef } from 'react'
import { PlusIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { useMediaUpload } from '~/components/video-editor/hooks/use-media-upload'

interface UploadButtonProps {
  trackIndex: number
  className?: string
}

export const UploadButton: FC<UploadButtonProps> = ({ trackIndex, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadMedia, getAcceptedFileType, getTrackType } = useMediaUpload()
  const trackType = getTrackType(trackIndex)
  const acceptedFileTypes = getAcceptedFileType(trackType)

  if (trackType === 'caption') return null

  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadMedia(trackIndex, file)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div
      className={cn('flex items-center', className)}
      onMouseDown={e => {
        e.stopPropagation()
      }}
      onClick={handleButtonClick}
    >
      <Button
        variant="secondary"
        className="border border-primary/20 bg-background ml-2"
        title={`Upload ${trackType === 'video' ? 'MP4' : trackType === 'audio' ? 'MP3' : 'media'}`}
      >
        <PlusIcon size={14} className="text-primary" />
      </Button>
      <input ref={fileInputRef} type="file" accept={acceptedFileTypes} onChange={handleFileChange} className="hidden" />
    </div>
  )
}
