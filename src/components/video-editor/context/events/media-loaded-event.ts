import { useCallback, useEffect } from 'react'
import { EventHandler } from './types'
import { createEventHook, createEventRegistry } from './utils'

export type MediaLoadedEvent = {
  trackIndex: number
  clipIndex: number
  file: File
  notify?: boolean
  words?: { word: string; start: number; end: number }[]
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
      words: hookResult.lastEvent?.words,
      notifyMediaLoaded: ({
        trackIndex,
        clipIndex,
        file,
        notify = true,
        words
      }: {
        trackIndex: number
        clipIndex: number
        file: File
        notify?: boolean
        words?: { word: string; start: number; end: number }[]
      }) => notify && registry.notify({ trackIndex, clipIndex, file, notify, words })
    }
  }

  const notifyMediaLoaded = useCallback(
    ({
      trackIndex,
      clipIndex,
      file,
      notify = true,
      words
    }: {
      trackIndex: number
      clipIndex: number
      file: File
      notify?: boolean
      words?: { word: string; start: number; end: number }[]
    }) => notify && registry.notify({ trackIndex, clipIndex, file, notify, words }),
    [registry]
  )

  return {
    registry,
    useOnMediaLoaded,
    notifyMediaLoaded
  }
}
