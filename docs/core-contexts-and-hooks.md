# Video Timeline API Overview

## VideoEditorProvider
- Multi-track data (video/audio)
- Player state and position tracking
- Media loading with auto-duration calculation
- Clip manipulation with collision detection

### useEditor
- Track management with collision detection and auto-gravity
- Player state synchronization between timeline and playback
- Playback controls (play/pause, time updates, loop control)
- Atomic clip operations (update, delete, split, volume control)

## RemotionTimelineProvider

### useRemotionTimeline
Entry point returning unified access to three timeline subsystems:
- timelineState
- timelineInteractions
- timelineDnd

### useTimeline
Core timeline state management:
- DOM references for positioning calculations
- Multi-level zoom system with transitions
- Time-to-pixel conversion and marker positioning
- Clip selection state management

### useTimelineInteractions
User input processing:
- Timeline scrubbing with precise time calculation
- Marker drag handling with visual feedback
- Clip selection state updates
- Resize operations with visual overlay and snapping

### useTimelineDnd
Drag-and-drop implementation (dnd-kit):
- Drag initialization with thresholds
- Visual feedback during movement
- Grid snapping and modifiers
- Intelligent clip placement with gap finding

## Architecture
```
┌────────────────────────────────────────────────────────────┐
│                    VideoEditorProvider                     │
│                                                            │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │ Track Data  │   │ Player State │   │ Clip Operations │  │
│  └─────────────┘   └──────────────┘   └─────────────────┘  │
│             │              │                   │           │
│             └──────────────┼───────────────────┘           │
│                            │                               │
│                      ┌─────▼─────┐                         │
│                      │ useEditor │                         │
│                      └─────┬─────┘                         │
└────────────────────────────┼───────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  RemotionTimelineProvider                   │
│                                                             │
│  ┌─────────────┐   ┌──────────────────┐   ┌──────────────┐  │
│  │ useTimeline │──▶│useTimelineInterac│──▶│useTimelineDnd│  │
│  │             │   │     tions        │   │              │  │
│  └─────────────┘   └──────────────────┘   └──────────────┘  │
│             │              │                   │            │
│             └──────────────┼───────────────────┘            │
│                            │                                │
│                 ┌──────────▼────────────┐                   │
│                 │   useRemotionTimeline │                   │
│                 └──────────┬────────────┘                   │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Timeline Components │
                  └─────────────────────┘
```