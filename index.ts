import './src/index.css'
import { VideoEditorProvider } from '~/components/video-editor/context/video-editor-provider'
import { Timeline } from '~/components/video-editor/timeline/timeline'
import { VideoPlayer } from '~/components/video-editor/player'
import {
  type Track,
  type TimelineStyle,
  type CompositionData,
  type CompositionTrack,
  type CompositionClip
} from '~/components/video-editor/types'

import { ZoomPlusControl } from '~/components/video-editor/controls/zoom-plus-control'
import { ZoomMinusControl } from '~/components/video-editor/controls/zoom-minus-control'
import { SelectedClipVolumeControl } from '~/components/video-editor/controls/selected-clip-volume-control'
import { TimeDisplay } from '~/components/video-editor/controls/time-display'
import { VideoLoopControl } from '~/components/video-editor/controls/video-loop-control'
import { PlayPauseControl } from '~/components/video-editor/controls/play-pause-control'
import { useCompositionData } from '~/components/video-editor/hooks/use-composition-data'
import { useTrackManager } from '~/components/video-editor/hooks/use-track-manager'
import { useVideoUpload } from '~/components/video-editor/hooks/use-video-upload'

// Core components
export { VideoEditorProvider }
export { VideoPlayer }
export { Timeline }

// Controls
export { ZoomPlusControl }
export { ZoomMinusControl }
export { SelectedClipVolumeControl }
export { TimeDisplay }
export { VideoLoopControl }
export { PlayPauseControl }

// Types
export { type Track }
export { type TimelineStyle }
export { type CompositionData }
export { type CompositionTrack }
export { type CompositionClip }

// Hooks
export { useCompositionData }
export { useTrackManager }

// Video upload utilities
export { useVideoUpload }
