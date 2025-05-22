export type Word = {
  word: string
  start: number
  end: number
}

export interface LoadVideoIntoTimelineParams {
  file: File | string
  trackIndex: number
  notify?: boolean
  words?: Word[]
}

export interface UseVideoUploadReturn {
  selectedFile: File | null
  selectedTrackIndex: number
  useDefaultFile: boolean
  defaultFileName: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectClick: () => Promise<void>
  handleTrackIndexChange: (index: number) => void
  selectVideoFile: () => Promise<File | null>
  loadVideoIntoTimeline: (params: LoadVideoIntoTimelineParams) => Promise<void>
  selectAndLoadVideo: (trackIndex?: number) => Promise<void>
}
