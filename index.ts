import './src/index.css'
import { VideoEditorProvider } from '~/components/video-editor/context/video-editor-provider'
import { Timeline } from '~/components/video-editor/timeline/timeline'
import { VideoPlayer } from '~/components/video-editor/player'
import {
  type Track,
  type TimelineStyle,
  type CompositionData,
  type CompositionTrack,
  type CompositionClip,
  type Clip
} from '~/components/video-editor/types'

import { SelectedVideoRenderSettingsControl } from '~/components/video-editor/controls/selected-video-render-settings-control'
import { TimeDisplay } from '~/components/video-editor/controls/time-display'
import { VideoLoopControl } from '~/components/video-editor/controls/video-loop-control'
import { PlayPauseControl } from '~/components/video-editor/controls/play-pause-control'
import { useCompositionData } from '~/components/video-editor/hooks/use-composition-data'
import { useTrackManager } from '~/components/video-editor/hooks/use-track-manager'
import { useVideoUpload } from '~/components/video-editor/hooks/use-video-upload'
import { useAudioUpload } from '~/components/video-editor/hooks/use-audio-upload'
import { useVideoTransform } from '~/components/video-editor/hooks/use-video-transform'
import { ZoomMinusControl } from '~/components/video-editor/controls/zoom-minus-control'
import { ZoomPlusControl } from '~/components/video-editor/controls/zoom-plus-control'

// Core components
export { VideoEditorProvider }
export { VideoPlayer }
export { Timeline }

// Controls
export { SelectedVideoRenderSettingsControl }
export { TimeDisplay }
export { VideoLoopControl }
export { PlayPauseControl }
export { ZoomMinusControl }
export { ZoomPlusControl }

// Types
export { type Track }
export { type TimelineStyle }
export { type CompositionData }
export { type CompositionTrack }
export { type CompositionClip }
export { type Clip }

// Hooks
export { useCompositionData }
export { useTrackManager }
export { useVideoUpload }
export { useAudioUpload }
export { useVideoTransform }
