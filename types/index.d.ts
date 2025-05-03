import { FC } from 'react'
import { ReactNode } from 'react'

declare type AudioClip = BaseClip & {
  type: 'audio'
  src: string
  volume?: number
}

declare type BaseClip = {
  from: number
  durationInFrames: number
  id: string
}

declare type ClipStyle = {
  root: string
  content: string
  active: {
    root: string
    resizeHandle: string
    content: string
    dragOrResize: string
  }
}

export declare interface CompositionClip {
  id: string
  type: 'video' | 'audio'
  from: number
  durationInFrames: number
  src: string
  volume?: number
}

export declare interface CompositionData {
  composition: {
    durationInFrames: number
    fps: number
  }
  tracks: CompositionTrack[]
  currentTime: number
}

export declare interface CompositionTrack {
  name: string
  volume: number
  clips: CompositionClip[]
}

declare type Clip = SolidClip | TextClip | VideoClip | AudioClip

export declare const PlayPauseControl: FC

export declare const SelectedClipVolumeControl: FC

declare type SolidClip = BaseClip & {
  type: 'solid'
  color: string
}

declare type TextClip = BaseClip & {
  type: 'text'
  text: string
  color: string
}

export declare const TimeDisplay: FC

export declare const Timeline: FC<{
  styles?: Partial<TimelineStyle>
}>

export declare type TimelineStyle = {
  root?: string
  timeMarker: TimeMarkerStyle
  timeRuler: TimeRulerStyle
  track: TrackStyle
}

declare type TimeMarkerStyle = {
  line: string
  handle: string
}

declare type TimeRulerStyle = {
  root: string
  gridLines: string
  label: string
}

export declare type Track = {
  name: string
  clips: Clip[]
  volume?: number
}

declare type TrackStyle = {
  root: string
  clip: ClipStyle
}

export declare function useCompositionData(): CompositionData

/**
 * Hook providing methods to manage tracks and clips in the video editor
 */
export declare function useTrackManager(): {
  tracks: Track[]
  createTrack: (name: string, volume?: number) => number
  removeTrack: (trackIndex: number) => void
  addVideoClip: (trackIndex: number, src: string) => string
  addAudioClip: (trackIndex: number, src: string) => string
  addClipToBeginning: (trackIndex: number, src: string, type: 'video' | 'audio') => string
  addClipToEnd: (trackIndex: number, src: string, type: 'video' | 'audio') => string
  removeClip: (trackIndex: number, clipId: string) => void
  updateClip: (trackIndex: number, clipId: string, updates: Partial<Omit<Clip, 'id' | 'type'>>) => void
  hasPendingOperations: () => boolean
}

export declare function useVideoUpload(): {
  selectVideoFile: () => Promise<File | null>
  loadVideoIntoTimeline: (file: File | string, trackIndex?: number) => Promise<void>
  selectAndLoadVideo: (trackIndex?: number) => Promise<void>
}

export declare const VideoEditorProvider: FC<VideoEditorProviderProps>

declare interface VideoEditorProviderProps {
  children: ReactNode
  initialTracks?: Track[]
}

declare type VideoClip = BaseClip & {
  type: 'video'
  src: string
  volume?: number
  renderOption?: 'default' | 'contain-blur' | 'cover'
  positionX?: number
  positionY?: number
  originalDuration?: number
}

export declare const VideoLoopControl: FC

export declare const VideoPlayer: FC

export declare const ZoomMinusControl: FC

export declare const ZoomPlusControl: FC

export {}
