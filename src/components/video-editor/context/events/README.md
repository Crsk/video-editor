# Events System

This directory contains the events system for the video editor. The system is designed to be modular and easy to extend with new event types.

## Structure

- `types.ts` - Contains the base types for the events system
- `utils.ts` - Contains utility functions for creating event registries and hooks
- `events-context.tsx` - The main context provider that combines all event types
- Individual event type files (e.g., `media-loaded-event.ts`, `clip-deleted-event.ts`)
- `event-template.ts` - A template for creating new event types
- `index.ts` - Exports all necessary components from the events system

## How to Add a New Event Type

1. Create a new file for your event type (e.g., `my-new-event.ts`)
2. Use the `event-template.ts` as a starting point
3. Define your event type and implement the necessary functions
4. Update the `events-context.tsx` file to include your new event type
5. Update the `index.ts` file to export your new event type
6. Update the `use-events.ts` hook to export your new event type

### Example

```typescript
// 1. Create my-new-event.ts
import { useCallback, useEffect } from 'react'
import { EventHandler } from './types'
import { createEventHook, createEventRegistry } from './utils'

export type MyNewEvent = {
  id: string
  // Add more properties as needed
}

export function useMyNewEvent() {
  const registry = createEventRegistry<MyNewEvent>()
  const hookResult = createEventHook<MyNewEvent>(registry)()

  const useOnMyNewEvent = (handler?: EventHandler<MyNewEvent>) => {
    useEffect(() => handler && registry.register(handler), [handler])

    return {
      id: hookResult.lastEvent?.id,
      notifyMyNewEvent: (event: MyNewEvent) => registry.notify(event)
    }
  }

  const notifyMyNewEvent = useCallback((event: MyNewEvent) => registry.notify(event), [registry])

  return {
    registry,
    useOnMyNewEvent,
    notifyMyNewEvent
  }
}

// 2. Update events-context.tsx
// Add to EventsContextState type
type EventsContextState = {
  mediaLoaded: ReturnType<typeof useMediaLoadedEvent>
  clipDeleted: ReturnType<typeof useClipDeletedEvent>
  myNewEvent: ReturnType<typeof useMyNewEvent> // Add this line
}

// Add to EventsProvider
export const EventsProvider: FC<EventsProviderProps> = ({ children }) => {
  const mediaLoadedEvent = useMediaLoadedEvent()
  const clipDeletedEvent = useClipDeletedEvent()
  const myNewEvent = useMyNewEvent() // Add this line

  const contextValue: EventsContextState = {
    mediaLoaded: mediaLoadedEvent,
    clipDeleted: clipDeletedEvent,
    myNewEvent // Add this line
  }

  return <EventsContext.Provider value={contextValue}>{children}</EventsContext.Provider>
}

// Add to useEvents hook
export const useEvents = () => {
  const { mediaLoaded, clipDeleted, myNewEvent } = useEventsContext() // Update this line

  return {
    useOnMediaLoaded: mediaLoaded.useOnMediaLoaded,
    notifyMediaLoaded: mediaLoaded.notifyMediaLoaded,
    useOnClipDeleted: clipDeleted.useOnClipDeleted,
    notifyClipDeleted: clipDeleted.notifyClipDeleted,
    useOnMyNewEvent: myNewEvent.useOnMyNewEvent, // Add this line
    notifyMyNewEvent: myNewEvent.notifyMyNewEvent // Add this line
  }
}

// 3. Update use-events.ts
export type { MyNewEvent } from '../context/events/my-new-event'
```
