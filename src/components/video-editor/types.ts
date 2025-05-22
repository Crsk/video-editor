type BaseClip = {
  from: number
  durationInFrames: number
  id: string
}

export type SolidClip = BaseClip & {
  type: 'solid'
  color: string
}

export type TextClip = BaseClip & {
  type: 'text'
  text: string
  color: string
}

export type VideoClip = BaseClip & {
  type: 'video'
  src: string
  volume?: number
  renderOption?: 'default' | 'contain-blur' | 'cover'
  positionX?: number
  positionY?: number
  zoom?: number
  originalDuration?: number
  offset?: number
  words?: { word: string; start: number; end: number }[]
}

export type AudioClip = BaseClip & {
  type: 'audio'
  src: string
  volume?: number
}

export type Clip = SolidClip | TextClip | VideoClip | AudioClip

export type MediaType = 'video' | 'audio'

export type AudibleClip = VideoClip | AudioClip

export type Track = {
  name: string
  clips: Clip[]
  volume?: number
  type?: Clip['type']
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
