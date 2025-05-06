# Feature: Upload & Load Media

## Key Components
- `useMediaUpload`: Handles file upload and creates initial clips
- `VideoEditorProvider`: Provides context to share track and clip state
- `useMediaLoader`: Loader that runs on track changes and sets clip properties
- `clip.duration`: Sets the length in the timeline track
- `clip.originalDuration`: Prevents expanding beyond the media's original length

## Sequence
1. User uploads a video or audio file from their computer
   - `UploadButton` → `useMediaUpload.uploadMedia`
   - Creates a new clip with minimal duration (1 frame)
   - Adds clip to the appropriate track

2. Media file is loaded and processed
   - `VideoEditorProvider` → `useMediaLoader`
   - Detects media type (video/audio)
   - Loads the file and calculates actual duration
   - Updates `clip.durationInFrames` and `clip.originalDuration`

3. Audio clip is added to the video player
   - `AudioClip` → `<Audio src="..." />`
   - Plays audio at the specified position in the timeline

4. Audio waveforms are created for visualization
   - `<Clip />` → `<AudioTrackVisualizer src={clip.src} />`
   - Generates visual representation of audio amplitude

## Implementation Details
- The `useMediaLoader` hook handles both video and audio files
- Media type detection is automatic based on file extension
- Duration is calculated in frames (based on FPS setting)
- Original duration is preserved to prevent stretching beyond the original media length
