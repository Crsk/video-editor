import { createContext, useCallback, useContext, useRef, useEffect, useState, ReactNode, FC } from 'react'

export type MediaLoadedEvent = {
  trackIndex: number
  file: File
  notify?: boolean
}

type EventHandler<T> = (event: T) => void
type EventRegistry<T> = {
  handlers: EventHandler<T>[]
  register: (handler: EventHandler<T>) => () => void
  notify: (event: T) => void
}

type EventMap = {
  mediaLoaded: EventRegistry<MediaLoadedEvent>
}

type EventsContextState = {
  [K in keyof EventMap]: EventMap[K]
}

const EventsContext = createContext<EventsContextState | undefined>(undefined)

type EventsProviderProps = {
  children: ReactNode
}

function createEventRegistry<T>(): EventRegistry<T> {
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

export const EventsProvider: FC<EventsProviderProps> = ({ children }) => {
  const mediaLoadedRegistry = createEventRegistry<MediaLoadedEvent>()

  const contextValue: EventsContextState = {
    mediaLoaded: mediaLoadedRegistry
  }

  return <EventsContext.Provider value={contextValue}>{children}</EventsContext.Provider>
}

const useEventsContext = () => {
  const context = useContext(EventsContext)
  if (context === undefined) {
    throw new Error('Events hooks must be used within an EventsProvider')
  }
  return context
}

function createEventHook<T extends Record<string, any>>(registry: EventRegistry<T>) {
  return () => {
    const [lastEvent, setLastEvent] = useState<T | null>(null)

    useEffect(() => {
      const handler = (event: T) => void setLastEvent(event)

      return registry.register(handler)
    }, [])

    const notify = useCallback(
      (...args: any[]) => {
        // @ts-ignore
        if (typeof registry.notify === 'function') registry.notify(...args)
      },
      [registry]
    )

    return {
      lastEvent,
      notify
    }
  }
}

export const useEvents = () => {
  const { mediaLoaded } = useEventsContext()
  const useOnMediaLoaded = (handler?: EventHandler<MediaLoadedEvent>) => {
    const hookResult = createEventHook<MediaLoadedEvent>(mediaLoaded)()

    useEffect(() => handler && mediaLoaded.register(handler), [handler])

    return {
      trackIndex: hookResult.lastEvent?.trackIndex,
      file: hookResult.lastEvent?.file,
      notifyMediaLoaded: ({ trackIndex, file, notify = true }: { trackIndex: number; file: File; notify?: boolean }) =>
        notify && mediaLoaded.notify({ trackIndex, file, notify })
    }
  }

  const notifyMediaLoaded = ({
    trackIndex,
    file,
    notify = true
  }: {
    trackIndex: number
    file: File
    notify?: boolean
  }) => notify && mediaLoaded.notify({ trackIndex, file, notify })

  return {
    useOnMediaLoaded,
    notifyMediaLoaded
  }
}
