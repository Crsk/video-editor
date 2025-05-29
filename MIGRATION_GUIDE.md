# Video Renderer Migration Guide

This guide helps you migrate from Remotion to a flexible video renderer abstraction that supports multiple backends.

## Overview

The new video renderer abstraction allows you to:
- Switch between different rendering engines (Remotion, HTML5, Konva, custom)
- Remove dependency on Remotion licensing
- Use a consistent API regardless of the underlying renderer

## Architecture

```
VideoRendererProvider
├── VideoRenderer Interface
├── Adapters
│   ├── RemotionAdapter (wraps Remotion components)
│   ├── HTML5Adapter (native HTML5 video/audio)
│   ├── KonvaAdapter (future: Canvas-based rendering)
│   └── CustomAdapter (your own implementation)
```

## Migration Steps

### 1. Wrap Your App with VideoRendererProvider

```tsx
import { VideoRendererProvider } from './lib/video-renderer/provider'

function App() {
  return (
    <VideoRendererProvider config={{ type: 'html5' }}>
      {/* Your app components */}
    </VideoRendererProvider>
  )
}
```

### 2. Replace Direct Remotion Imports

**Before:**
```tsx
import { Player } from '@remotion/player'
import { AbsoluteFill, Sequence, OffthreadVideo, Audio } from 'remotion'
```

**After:**
```tsx
import { useVideoRenderer } from './lib/video-renderer/provider'

function MyComponent() {
  const { renderer } = useVideoRenderer()
  const { Player, AbsoluteFill, Sequence, Video, Audio } = renderer
  
  // Use components as before
}
```

### 3. Update Media Processing

**Before:**
```tsx
import { parseMedia } from '@remotion/media-parser'
import { getAudioData, getWaveformPortion } from '@remotion/media-utils'
```

**After:**
```tsx
import { useVideoRenderer } from './lib/video-renderer/provider'

function MyComponent() {
  const { renderer } = useVideoRenderer()
  
  // Use renderer.parseMedia, renderer.getAudioData, etc.
  const handleFileUpload = async (file: File) => {
    const metadata = await renderer.parseMedia(file)
    // ...
  }
}
```

## Renderer Options

### HTML5 Renderer (Default)
- No external dependencies
- Uses native HTML5 video/audio elements
- Basic functionality, good for simple use cases

```tsx
<VideoRendererProvider config={{ type: 'html5' }}>
```

### Remotion Renderer
- Full Remotion compatibility
- Requires Remotion license
- Advanced video processing capabilities

```tsx
<VideoRendererProvider config={{ type: 'remotion' }}>
```

### Custom Renderer
- Implement your own renderer
- Must conform to VideoRenderer interface

```tsx
<VideoRendererProvider config={{ 
  type: 'custom', 
  options: { adapter: myCustomRenderer } 
}}>
```

## Component Replacements

### Player Component

**Before:**
```tsx
<Player
  ref={playerRef}
  component={MainComposition}
  fps={30}
  // ... other props
/>
```

**After:**
```tsx
const { renderer } = useVideoRenderer()
const { Player } = renderer

<Player
  ref={playerRef}
  component={MainComposition}
  fps={30}
  // ... other props
/>
```

### Composition Components

Use the abstracted versions:
- `MainCompositionAbstracted` instead of `MainComposition`
- `TrackRendererAbstracted` instead of `TrackRenderer`
- `ClipRendererAbstracted` instead of `ClipRenderer`

## Benefits

1. **No Vendor Lock-in**: Easy to switch between rendering engines
2. **Reduced Dependencies**: Use HTML5 renderer to avoid Remotion
3. **Consistent API**: Same interface regardless of backend
4. **Future-Proof**: Easy to add new renderers (Konva, WebGL, etc.)
5. **Gradual Migration**: Can use both old and new components during transition

## Limitations

### HTML5 Renderer
- Limited to basic video/audio playback
- No advanced effects or transformations
- Simplified waveform generation

### Remotion Renderer
- Still requires Remotion license
- Larger bundle size

## Next Steps

1. Start with HTML5 renderer for basic functionality
2. Gradually migrate components to use abstraction
3. Add Konva renderer for advanced canvas-based rendering
4. Implement custom renderers for specific needs

## Example: Complete Migration

```tsx
// Old approach
import { Player } from '@remotion/player'
import { AbsoluteFill } from 'remotion'

function VideoEditor() {
  return (
    <Player
      component={({ tracks }) => (
        <AbsoluteFill>
          {/* render tracks */}
        </AbsoluteFill>
      )}
      // ... props
    />
  )
}

// New approach
import { VideoRendererProvider, useVideoRenderer } from './lib/video-renderer'

function VideoEditor() {
  const { renderer } = useVideoRenderer()
  const { Player, AbsoluteFill } = renderer
  
  return (
    <Player
      component={({ tracks }) => (
        <AbsoluteFill>
          {/* render tracks */}
        </AbsoluteFill>
      )}
      // ... props
    />
  )
}

function App() {
  return (
    <VideoRendererProvider config={{ type: 'html5' }}>
      <VideoEditor />
    </VideoRendererProvider>
  )
}
``` 