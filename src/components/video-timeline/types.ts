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
