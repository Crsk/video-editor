import { createContext, FC, ReactNode, useContext } from 'react'

interface MediaUploadContextType {
  onMediaLoaded?: (trackIndex: number, file: File) => void
}

const MediaUploadContext = createContext<MediaUploadContextType>({})

export const MediaUploadProvider: FC<{
  children: ReactNode
  onMediaLoaded?: (trackIndex: number, file: File) => void
}> = ({ children, onMediaLoaded }) => {
  return <MediaUploadContext.Provider value={{ onMediaLoaded }}>{children}</MediaUploadContext.Provider>
}

export const useMediaUploadContext = () => useContext(MediaUploadContext)
