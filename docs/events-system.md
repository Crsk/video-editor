# Events System

## Using Events

### Listening for Events

To listen for events in your components, use the `useEvents` hook to access event-specific hooks:

```tsx
import { useEvents } from 'video-timeline'

function MyComponent() {
  const { useOnMediaLoaded } = useEvents()  
  useOnMediaLoaded((event) => console.log(`Media loaded: ${event.file.name} in track ${event.trackIndex}`))
  
  return <div>My Component</div>
}
```

### Triggering Events

To trigger events from your components, use the notification functions from the same `useEvents` hook:

```tsx
import { useEvents } from 'video-timeline'

function UploadButton() {
  const { notifyMediaLoaded } = useEvents()
  const handleFileUpload = (file) => notifyMediaLoaded(0, file)

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
}

// 4. Add Hook and Notification Functions
export const useEvents = () => {
  const { mediaLoaded, trackAdded } = useEventsContext()
  
  const useOnTrackAdded = (handler: EventHandler<TrackAddedEvent>) => {
    useEffect(() => {
      const cleanup = trackAdded.register(handler)
      return cleanup
    }, [handler])
  }
  
  const notifyTrackAdded = (trackIndex: number, name: string, type: 'video' | 'audio') => {
    trackAdded.notify({ trackIndex, name, type })
  }
  
  return {
    useOnTrackAdded,
    notifyTrackAdded
  }
}
```
