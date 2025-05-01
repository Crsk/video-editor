import './src/index.css'
import { EditorProvider } from '~/components/video-editor/context/editor-context'
import { Timeline } from '~/components/video-editor/timeline/timeline'
import { VideoPlayer } from '~/components/video-editor/player'
import { type Track, type TimelineStyle } from '~/components/video-editor/types'

import { ZoomPlusControl } from '~/components/video-editor/controls/zoom-plus-control'
import { ZoomMinusControl } from '~/components/video-editor/controls/zoom-minus-control'
import { SelectedClipVolumeControl } from '~/components/video-editor/controls/selected-clip-volume-control'
import { TimeDisplay } from '~/components/video-editor/controls/time-display'
import { VideoLoopControl } from '~/components/video-editor/controls/video-loop-control'
import { PlayPauseControl } from '~/components/video-editor/controls/play-pause-control'

export { EditorProvider }
export { type Track }
export { VideoPlayer }
export { Timeline }

export { ZoomPlusControl }
export { ZoomMinusControl }
export { SelectedClipVolumeControl }
export { TimeDisplay }
export { VideoLoopControl }
export { PlayPauseControl }
export { type TimelineStyle }
