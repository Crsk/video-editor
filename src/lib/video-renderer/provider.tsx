import React, { createContext, useContext, ReactNode } from 'react'
import { VideoRenderer, VideoRendererConfig } from './types'
import { createVideoRenderer, defaultConfig } from './index'

interface VideoRendererContextValue {
  renderer: VideoRenderer
  config: VideoRendererConfig
}

const VideoRendererContext = createContext<VideoRendererContextValue | undefined>(undefined)

interface VideoRendererProviderProps {
  children: ReactNode
  config?: VideoRendererConfig
}

export const VideoRendererProvider: React.FC<VideoRendererProviderProps> = ({ children, config = defaultConfig }) => {
  const renderer = createVideoRenderer(config)

  return <VideoRendererContext.Provider value={{ renderer, config }}>{children}</VideoRendererContext.Provider>
}

export function useVideoRenderer(): VideoRendererContextValue {
  const context = useContext(VideoRendererContext)
  if (!context) {
    throw new Error('useVideoRenderer must be used within a VideoRendererProvider')
  }
  return context
}
