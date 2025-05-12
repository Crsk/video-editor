import { createContext, useCallback, useContext, useRef, useEffect, ReactNode, FC } from 'react'

export type MediaLoadedEvent = {
  trackIndex: number
  file: File
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

export const useEvents = () => {
  const { mediaLoaded } = useEventsContext()
  const useOnMediaLoaded = (handler: EventHandler<MediaLoadedEvent>) => {
    useEffect(() => {
      const cleanup = mediaLoaded.register(handler)

      return cleanup
    }, [handler])
  }

  const notifyMediaLoaded = (trackIndex: number, file: File) => {
    mediaLoaded.notify({ trackIndex, file })
  }

  return {
    useOnMediaLoaded,
    notifyMediaLoaded
  }
}
