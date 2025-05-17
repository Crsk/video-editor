import { useCallback, useEffect } from 'react'
import { EventHandler } from './types'
import { createEventHook, createEventRegistry } from './utils'

export type ClipDeletedEvent = {
  trackIndex: number
  clipIndex: number
  clipId?: string
}

export const useClipDeletedEvent = () => {
  const registry = createEventRegistry<ClipDeletedEvent>()
  const hookResult = createEventHook<ClipDeletedEvent>(registry)()

  const useOnClipDeleted = (handler?: EventHandler<ClipDeletedEvent>) => {
    useEffect(() => handler && registry.register(handler), [handler])

    return {
      trackIndex: hookResult.lastEvent?.trackIndex,
      clipIndex: hookResult.lastEvent?.clipIndex,
      clipId: hookResult.lastEvent?.clipId,
      notifyClipDeleted: (event: ClipDeletedEvent) => registry.notify(event)
    }
  }

  const notifyClipDeleted = useCallback((event: ClipDeletedEvent) => registry.notify(event), [registry])

  return {
    registry,
    useOnClipDeleted,
    notifyClipDeleted
  }
}
