import { createContext, useContext, FC } from 'react'
import { EventsProviderProps } from './types'
import { useMediaLoadedEvent } from './media-loaded-event'
import { useClipDeletedEvent } from './clip-deleted-event'

type EventsContextState = {
  mediaLoaded: ReturnType<typeof useMediaLoadedEvent>
  clipDeleted: ReturnType<typeof useClipDeletedEvent>
}

const EventsContext = createContext<EventsContextState | undefined>(undefined)

export const EventsProvider: FC<EventsProviderProps> = ({ children }) => {
  const mediaLoadedEvent = useMediaLoadedEvent()
  const clipDeletedEvent = useClipDeletedEvent()

  const contextValue: EventsContextState = {
    mediaLoaded: mediaLoadedEvent,
    clipDeleted: clipDeletedEvent
  }

  return <EventsContext.Provider value={contextValue}>{children}</EventsContext.Provider>
}

export const useEventsContext = () => {
  const context = useContext(EventsContext)
  if (context === undefined) throw new Error('Events hooks must be used within an EventsProvider')

  return context
}

export const useEvents = () => {
  const { mediaLoaded, clipDeleted } = useEventsContext()

  return {
    useOnMediaLoaded: mediaLoaded.useOnMediaLoaded,
    notifyMediaLoaded: mediaLoaded.notifyMediaLoaded,
    useOnClipDeleted: clipDeleted.useOnClipDeleted,
    notifyClipDeleted: clipDeleted.notifyClipDeleted
  }
}
