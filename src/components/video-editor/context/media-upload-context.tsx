import { createContext, FC, ReactNode, useContext } from 'react'

interface MediaUploadContextType {
  onMediaLoad?: (trackIndex: number, file: File) => void
}

const MediaUploadContext = createContext<MediaUploadContextType>({})

export const MediaUploadProvider: FC<{
  children: ReactNode
  onMediaLoad?: (trackIndex: number, file: File) => void
}> = ({ children, onMediaLoad }) => {
  return (
    <MediaUploadContext.Provider value={{ onMediaLoad }}>
      {children}
    </MediaUploadContext.Provider>
  )
}

export const useMediaUploadContext = () => useContext(MediaUploadContext)
