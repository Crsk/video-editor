# Video Timeline Public API

## Core Components

### VideoEditorProvider
- Multi-track video/audio timeline management
- Player state synchronization
- Media loading with duration detection
- Clip manipulation with collision detection

### VideoPlayer
- Video playback component integrated with timeline
- Supports custom rendering options (default, contain-blur, cover)
- Synchronized with timeline marker position

### Timeline
- Visual timeline interface with customizable styling
- Track visualization with drag-and-drop support
- Time ruler with frame markers
- Clip selection, resizing, and positioning

## Controls

### PlayPauseControl
Toggle playback state of the video editor

### TimeDisplay
Shows current playback position in the timeline

### VideoLoopControl
Toggles looping behavior for video playback

### ZoomPlusControl / ZoomMinusControl
Adjust timeline zoom level for precise editing

### SelectedVideoRenderSettingsControl
Configure rendering options for selected video clips

## Hooks

### useCompositionData
- Provides formatted composition data for rendering
- Aggregates track, clip, and timing information
- Useful for integration with external rendering systems

### useTrackManager
- Track and clip management utilities
- Add, remove, and update tracks and clips
- Position calculation with collision detection
- Clip splitting and manipulation

### useVideoUpload / useAudioUpload
- Media file selection and upload handling
- Automatic duration calculation
- Timeline integration with proper positioning

### useVideoTransform
- Video transformation utilities
- Position, scale, and zoom calculations
- Volume control and rendering option management

## Types

### Track
Represents a timeline track containing multiple clips

### Clip
Base clip type with timing and source information

### CompositionData / CompositionTrack / CompositionClip
Data structures for representing the complete timeline state

### TimelineStyle
Styling options for customizing timeline appearance

## Architecture
```
┌─────────────────────────────────────────┐
│           VideoEditorProvider           │
│                                         │
│  ┌───────────┐   ┌────────────────────┐ │
│  │ Timeline  │   │     VideoPlayer    │ │
│  └───────────┘   └────────────────────┘ │
│        │                   │            │
└────────┼───────────────────┼────────────┘
         │                   │
┌────────▼───────┐  ┌────────▼───────────┐
│    Controls    │  │        Hooks        │
│                │  │                     │
│ PlayPause      │  │ useCompositionData  │
│ TimeDisplay    │  │ useTrackManager     │
│ VideoLoop      │  │ useVideoUpload      │
│ Zoom Controls  │  │ useAudioUpload      │
│ RenderSettings │  │ useVideoTransform   │
└────────────────┘  └─────────────────────┘
```
