# Video Renderer Abstraction

A flexible abstraction layer for video rendering that allows you to switch between different rendering engines without changing your application code.

## Features

- **Multiple Backends**: Support for Remotion, HTML5, Konva, and custom renderers
- **Consistent API**: Same interface regardless of the underlying renderer
- **No Vendor Lock-in**: Easy to switch between rendering engines
- **Gradual Migration**: Use alongside existing code during transition
- **TypeScript Support**: Full type safety across all adapters

## Quick Start

### 1. Install Dependencies

For HTML5 renderer (no additional dependencies needed):
```bash
# Already included in your project
```

For Remotion renderer:
```bash
npm install @remotion/player @remotion/media-parser @remotion/media-utils remotion
```

For Konva renderer:
```bash
npm install konva react-konva @types/konva
```

### 2. Wrap Your App

```tsx
import { VideoRendererProvider } from './lib/video-renderer/provider'

function App() {
  return (
    <VideoRendererProvider config={{ type: 'html5' }}>
      <YourVideoEditor />
    </VideoRendererProvider>
  )
}
```

### 3. Use the Renderer

```tsx
import { useVideoRenderer } from './lib/video-renderer/provider'

function VideoPlayer() {
  const { renderer } = useVideoRenderer()
  const { Player, AbsoluteFill, Sequence, Video, Audio } = renderer
  
  return (
    <Player
      component={MyComposition}
      fps={30}
      durationInFrames={300}
      compositionWidth={720}
      compositionHeight={1280}
    />
  )
}
```

## Available Renderers

### HTML5 Renderer

**Pros:**
- No external dependencies
- Lightweight
- Good browser compatibility
- No licensing requirements

**Cons:**
- Limited functionality
- Basic video/audio support only
- No advanced effects

**Use Case:** Simple video playback, prototyping, avoiding Remotion dependency

```tsx
<VideoRendererProvider config={{ type: 'html5' }}>
```

### Remotion Renderer

**Pros:**
- Full Remotion compatibility
- Advanced video processing
- Rich ecosystem
- Professional features

**Cons:**
- Requires Remotion license
- Larger bundle size
- External dependency

**Use Case:** Production applications requiring advanced video features

```tsx
<VideoRendererProvider config={{ type: 'remotion' }}>
```

### Konva Renderer

**Pros:**
- Canvas-based rendering
- High performance
- Custom graphics support
- Advanced transformations

**Cons:**
- Requires implementation
- More complex setup
- Learning curve

**Use Case:** Custom graphics, advanced animations, canvas-based effects

```tsx
<VideoRendererProvider config={{ type: 'konva' }}>
```

### Custom Renderer

**Pros:**
- Complete control
- Tailored to your needs
- No external dependencies (if desired)

**Cons:**
- Requires full implementation
- Maintenance overhead

**Use Case:** Specific requirements not met by existing renderers

```tsx
<VideoRendererProvider config={{ 
  type: 'custom', 
  options: { adapter: myCustomRenderer } 
}}>
```

## API Reference

### VideoRenderer Interface

```tsx
interface VideoRenderer {
  // Components
  Player: FC<VideoPlayerProps>
  Sequence: FC<SequenceProps>
  AbsoluteFill: FC<AbsoluteFillProps>
  Video: FC<VideoProps>
  Audio: FC<AudioProps>
  
  // Media utilities
  parseMedia: (file: File) => Promise<MediaParserResult>
  getAudioData: (src: string) => Promise<AudioData>
  getWaveformPortion: (params: WaveformParams) => WaveformPortion
}
```

### VideoPlayerRef

```tsx
interface VideoPlayerRef {
  play: () => void
  pause: () => void
  toggle: () => void
  seekTo: (frame: number) => void
  getContainerNode: () => HTMLDivElement | null
  getCurrentFrame: () => number
}
```

### Configuration

```tsx
interface VideoRendererConfig {
  type: 'remotion' | 'html5' | 'konva' | 'custom'
  options?: Record<string, any>
}
```

## Migration from Remotion

### Before
```tsx
import { Player } from '@remotion/player'
import { AbsoluteFill, Sequence, OffthreadVideo } from 'remotion'
import { parseMedia } from '@remotion/media-parser'

function MyComponent() {
  return (
    <Player component={MyComposition} />
  )
}
```

### After
```tsx
import { useVideoRenderer } from './lib/video-renderer/provider'

function MyComponent() {
  const { renderer } = useVideoRenderer()
  const { Player } = renderer
  
  return (
    <Player component={MyComposition} />
  )
}
```

## Creating Custom Adapters

To create a custom adapter, implement the `VideoRenderer` interface:

```tsx
import { VideoRenderer } from './types'

export const myCustomAdapter: VideoRenderer = {
  Player: MyCustomPlayer,
  Sequence: MyCustomSequence,
  AbsoluteFill: MyCustomAbsoluteFill,
  Video: MyCustomVideo,
  Audio: MyCustomAudio,
  parseMedia: myParseMedia,
  getAudioData: myGetAudioData,
  getWaveformPortion: myGetWaveformPortion
}
```

## Examples

See `src/examples/video-renderer-example.tsx` for complete examples showing:
- Basic usage with different renderers
- Media processing
- Component composition
- Switching between renderers

## Performance Considerations

### HTML5 Renderer
- Lightweight but limited
- Good for simple use cases
- Minimal memory usage

### Remotion Renderer
- More memory intensive
- Better for complex compositions
- Optimized for video processing

### Konva Renderer
- Canvas-based, good for graphics
- Can be memory intensive with large canvases
- Excellent for custom animations

## Troubleshooting

### Common Issues

1. **Type errors with refs**: Ensure you're using the correct `VideoPlayerRef` type
2. **Missing components**: Check that your adapter implements all required components
3. **Performance issues**: Consider switching to a more appropriate renderer for your use case

### Debug Mode

Enable debug logging:
```tsx
<VideoRendererProvider 
  config={{ 
    type: 'html5',
    options: { debug: true }
  }}
>
```

## Contributing

To add a new renderer:

1. Create adapter in `src/lib/video-renderer/adapters/`
2. Implement the `VideoRenderer` interface
3. Add to factory function in `index.ts`
4. Update types if needed
5. Add tests and documentation

## License

This abstraction layer is part of your project and follows your project's license. Individual renderers may have their own licensing requirements (e.g., Remotion requires a license for commercial use). 