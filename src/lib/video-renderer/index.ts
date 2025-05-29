import { VideoRenderer, VideoRendererConfig } from './types'
import { remotionAdapter } from './adapters/remotion-adapter'
import { html5Adapter } from './adapters/html5-adapter'
import { konvaAdapter } from './adapters/konva-adapter'

// Factory function to create video renderer based on config
export function createVideoRenderer(config: VideoRendererConfig): VideoRenderer {
  switch (config.type) {
    case 'remotion':
      return remotionAdapter
    case 'html5':
      return html5Adapter
    case 'konva':
      return konvaAdapter
    case 'custom':
      if (!config.options?.adapter) {
        throw new Error('Custom adapter must be provided in config.options.adapter')
      }
      return config.options.adapter
    default:
      throw new Error(`Unsupported video renderer type: ${config.type}`)
  }
}

// Default configuration
export const defaultConfig: VideoRendererConfig = {
  type: 'html5' // Default to HTML5 to avoid Remotion dependency
}

// Convenience function to get default renderer
export function getDefaultVideoRenderer(): VideoRenderer {
  return createVideoRenderer(defaultConfig)
}

// Export types and adapters
export * from './types'
export { remotionAdapter } from './adapters/remotion-adapter'
export { html5Adapter } from './adapters/html5-adapter'
export { konvaAdapter } from './adapters/konva-adapter'
