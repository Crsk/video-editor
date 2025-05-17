import { useCallback, useEffect, useRef, useState } from 'react'
import { EventHandler, EventRegistry } from './types'

export const createEventRegistry = <T>(): EventRegistry<T> => {
  const handlersRef = useRef<EventHandler<T>[]>([])
  const register = useCallback((handler: EventHandler<T>) => {
    handlersRef.current = [...handlersRef.current, handler]

    return () => (handlersRef.current = handlersRef.current.filter(h => h !== handler))
  }, [])

  const notify = useCallback((event: T) => void handlersRef.current.forEach(handler => handler(event)), [])

  return {
    handlers: handlersRef.current,
    register,
    notify
  }
}

export const createEventHook = <T extends Record<string, any>>(registry: EventRegistry<T>) => {
  return () => {
    const [lastEvent, setLastEvent] = useState<T | null>(null)

    useEffect(() => {
      const handler = (event: T) => void setLastEvent(event)

      return registry.register(handler)
    }, [])

    const notify = useCallback(
      (event: T) => {
        if (typeof registry.notify === 'function') registry.notify(event)
      },
      [registry]
    )

    return {
      lastEvent,
      notify
    }
  }
}
