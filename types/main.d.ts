import { FC } from 'react'

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

declare type EditorProps = {
  tracks: Track[]
}

declare type Clip = SolidClip | TextClip | VideoClip | AudioClip

declare type SolidClip = BaseClip & {
  type: 'solid'
  color: string
}

declare type TextClip = BaseClip & {
  type: 'text'
  text: string
  color: string
}

export declare type Track = {
  name: string
  clips: Clip[]
  volume?: number
}

export declare const VideoEditor: FC<EditorProps>

declare type VideoClip = BaseClip & {
  type: 'video'
  src: string
  volume?: number
}

export {}
