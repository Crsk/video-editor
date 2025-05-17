import { useCallback, useEffect } from 'react'
import { EventHandler } from './types'
import { createEventHook, createEventRegistry } from './utils'

export type MediaLoadedEvent = {
  trackIndex: number
  clipIndex: number
  file: File
  notify?: boolean
}

export const useMediaLoadedEvent = () => {
  const registry = createEventRegistry<MediaLoadedEvent>()
  const hookResult = createEventHook<MediaLoadedEvent>(registry)()

  const useOnMediaLoaded = (handler?: EventHandler<MediaLoadedEvent>) => {
    useEffect(() => handler && registry.register(handler), [handler])

    return {
      trackIndex: hookResult.lastEvent?.trackIndex,
      clipIndex: hookResult.lastEvent?.clipIndex,
      file: hookResult.lastEvent?.file,
      notifyMediaLoaded: ({
        trackIndex,
        clipIndex,
        file,
        notify = true
      }: {
        trackIndex: number
        clipIndex: number
        file: File
        notify?: boolean
      }) => notify && registry.notify({ trackIndex, clipIndex, file, notify })
    }
  }

  const notifyMediaLoaded = useCallback(
    ({
      trackIndex,
      clipIndex,
      file,
      notify = true
    }: {
      trackIndex: number
      clipIndex: number
      file: File
      notify?: boolean
    }) => notify && registry.notify({ trackIndex, clipIndex, file, notify }),
    [registry]
  )

  return {
    registry,
    useOnMediaLoaded,
    notifyMediaLoaded
  }
}
