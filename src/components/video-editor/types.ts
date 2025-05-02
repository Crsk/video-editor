type BaseItem = {
  from: number
  durationInFrames: number
  id: string
}

export type SolidItem = BaseItem & {
  type: 'solid'
  color: string
}

export type TextItem = BaseItem & {
  type: 'text'
  text: string
  color: string
}

export type VideoItem = BaseItem & {
  type: 'video'
  src: string
  volume?: number
  renderOption?: 'default' | 'contain-blur' | 'cover'
  positionX?: number // Value between -100 and 100 for horizontal position (default: 0 = center)
  positionY?: number // Value between -100 and 100 for vertical position (default: 0 = center)
  originalDuration?: number
}

export type AudioItem = BaseItem & {
  type: 'audio'
  src: string
  volume?: number
}

export type Item = SolidItem | TextItem | VideoItem | AudioItem

export type AudibleItem = VideoItem | AudioItem

export type Track = {
  name: string
  items: Item[]
  volume?: number
}

export type TimeRulerStyle = {
  root: string
  gridLines: string
  label: string
}

export type ClipStyle = {
  root: string
  content: string
  active: {
    root: string
    resizeHandle: string
    content: string
    dragOrResize: string
  }
}

export type TrackStyle = {
  root: string
  clip: ClipStyle
}

export type TimeMarkerStyle = {
  line: string
  handle: string
}

export type TimelineStyle = {
  root?: string
  timeMarker: TimeMarkerStyle
  timeRuler: TimeRulerStyle
  track: TrackStyle
}

export interface CompositionClip {
  id: string
  type: 'video' | 'audio'
  from: number
  durationInFrames: number
  src: string
  volume?: number
}

export interface CompositionTrack {
  name: string
  volume: number
  clips: CompositionClip[]
}

export interface CompositionData {
  composition: {
    durationInFrames: number
    fps: number
  }
  tracks: CompositionTrack[]
  currentTime: number
}
