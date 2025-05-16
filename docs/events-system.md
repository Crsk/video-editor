# Events System

## Using Events

### Listening for Events

The events system provides multiple ways to interact with events:

#### 1. Using a handler function

```tsx
import { useEvents } from 'video-timeline'

function MyComponent() {
  const { useOnMediaLoaded } = useEvents()  
  useOnMediaLoaded((event) => console.log(`Media loaded: ${event.file.name} in track ${event.trackIndex}`))
  
  return <div>My Component</div>
}
```

#### 2. Accessing event data directly

```tsx
import { useEvents } from 'video-timeline'
import { useEffect } from 'react'

function MediaTracker() {
  const { useOnMediaLoaded } = useEvents()
  const { trackIndex, file } = useOnMediaLoaded()
  
  useEffect(() => {
    console.log(`Media loaded: ${file.name} in track ${trackIndex}`)
  }, [trackIndex, file])
  
  return <div>Media Tracker</div>
}
```

### Triggering Events

You can trigger events in two ways:

#### 1. Using the global notification function

```tsx
import { useEvents } from 'video-timeline'

function UploadButton() {
  const { notifyMediaLoaded } = useEvents()
  const handleFileUpload = (file) => notifyMediaLoaded({ trackIndex: 0, file })

  return <button onClick={handleFileSelect}>Upload Media</button>
}
```

#### 2. Using the notification function from the hook

```tsx
import { useEvents } from 'video-timeline'

function UploadButton() {
  const { useOnMediaLoaded } = useEvents()
  const { notifyMediaLoaded } = useOnMediaLoaded()
  const handleFileUpload = (file) => notifyMediaLoaded({ trackIndex: 0, file })

  return <button onClick={handleFileSelect}>Upload Media</button>
}
```

## Adding a New Event Type

Here's a complete example of adding a new `TrackAdded` event:

```tsx
// 1. Define the event type
export type TrackAddedEvent = {
  trackIndex: number
  name: string
  type: 'video' | 'audio'
}

// 2. Update the Event Map
type EventMap = {
  mediaLoaded: EventRegistry<MediaLoadedEvent>
  trackAdded: EventRegistry<TrackAddedEvent> // add this
}

// 3. Create an Event Registry
export const EventsProvider: FC<EventsProviderProps> = ({ children }) => {
  const mediaLoadedRegistry = createEventRegistry<MediaLoadedEvent>()
  const trackAddedRegistry = createEventRegistry<TrackAddedEvent>() // add this
  
  const contextValue: EventsContextState = {
    mediaLoaded: mediaLoadedRegistry,
    trackAdded: trackAddedRegistry // add this
  }
  
  return <EventsContext.Provider value={contextValue}>{children}</EventsContext.Provider>
}

// 4. Add Hook and Notification Functions
export const useEvents = () => {
  const { mediaLoaded, trackAdded } = useEventsContext()
  
  // Create a hook for track added events
  const useOnTrackAdded = (handler?: EventHandler<TrackAddedEvent>) => {
    const hookResult = createEventHook<TrackAddedEvent>(trackAdded)()
    
    // Register external handler if provided
    useEffect(() => {
      if (handler) {
        return trackAdded.register(handler)
      }
    }, [handler])
    
    return {
      trackIndex: hookResult.lastEvent?.trackIndex,
      name: hookResult.lastEvent?.name,
      type: hookResult.lastEvent?.type,
      notifyTrackAdded: (trackIndex: number, name: string, type: 'video' | 'audio') => {
        trackAdded.notify({ trackIndex, name, type })
      }
    }
  }
  
  const notifyTrackAdded = (trackIndex: number, name: string, type: 'video' | 'audio') => {
    trackAdded.notify({ trackIndex, name, type })
  }
  
  return {
    useOnTrackAdded,
    notifyTrackAdded,
    // ... other hooks and notification functions
  }
}
```
