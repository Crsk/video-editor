import { useState, useRef, ChangeEvent, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useEditor } from '../context/video-editor-provider'
import { useEvents } from '../context/events-context'

export interface UseVideoUploadReturn {
  selectedFile: File | null
  selectedTrackIndex: number
  useDefaultFile: boolean
  defaultFileName: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleSelectClick: () => Promise<void>
  handleTrackIndexChange: (index: number) => void
  selectVideoFile: () => Promise<File | null>
  loadVideoIntoTimeline: ({
    file,
    trackIndex,
    notify
  }: {
    file: File | string
    trackIndex: number
    notify?: boolean
  }) => Promise<void>
  selectAndLoadVideo: (trackIndex?: number) => Promise<void>
}

export function useVideoUpload(): UseVideoUploadReturn {
  const { setTracks } = useEditor()
  const { notifyMediaLoaded } = useEvents()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0)
  const [useDefaultFile, setUseDefaultFile] = useState<boolean>(false)
  const [defaultFileName] = useState<string>('manson_clone.mp4')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectVideoFile = useCallback((): Promise<File | null> => {
    return new Promise(resolve => {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'video/*'
      fileInput.style.display = 'none'
      document.body.appendChild(fileInput)

      fileInput.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0] || null
        document.body.removeChild(fileInput)
        resolve(file)
      }

      fileInput.oncancel = () => {
        document.body.removeChild(fileInput)
        resolve(null)
      }

      fileInput.click()
    })
  }, [])

  const loadVideoIntoTimeline = useCallback(
    ({
      file,
      trackIndex,
      notify = true
    }: {
      file: File | string
      trackIndex: number
      notify?: boolean
    }): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          const src = typeof file === 'string' ? file : URL.createObjectURL(file)

          const video = document.createElement('video')
          video.preload = 'metadata'
          video.src = src

          video.onloadedmetadata = () => {
            const FPS = 30
            const durationInSeconds = video.duration
            const durationInFrames = Math.ceil(durationInSeconds * FPS)

            setTracks(prevTracks => {
              const newTracks = JSON.parse(JSON.stringify(prevTracks))
              const clips = newTracks[trackIndex].clips
              const lastClipIndex = clips.length - 1
              const lastClip = lastClipIndex >= 0 ? clips[lastClipIndex] : null
              const startFrame = lastClip ? lastClip.from + lastClip.durationInFrames : 0
              const newClipId = uuidv4()
              const newClip = {
                id: newClipId,
                from: startFrame,
                durationInFrames: durationInFrames,
                originalDuration: durationInFrames,
                type: 'video',
                src
              }

              newTracks[trackIndex].clips = [...newTracks[trackIndex].clips, newClip]

              return newTracks
            })

            if (file instanceof File && notify) notifyMediaLoaded({ trackIndex, file })

            resolve()
          }

          video.onerror = () => {
            reject(new Error('Failed to load video'))
          }
        } catch (error) {
          reject(error)
        }
      })
    },
    [setTracks]
  )

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setUseDefaultFile(false)
    }
  }

  const handleSelectClick = async () => {
    const file = await selectVideoFile()
    if (file) {
      setSelectedFile(file)
      setUseDefaultFile(false)
      loadVideoIntoTimeline({ file, trackIndex: selectedTrackIndex })
    }
  }

  // Test file handlers moved to VideoUpload component

  const handleTrackIndexChange = (index: number) => {
    setSelectedTrackIndex(index)
  }

  const selectAndLoadVideo = useCallback(
    async (trackIndex: number = 0): Promise<void> => {
      const file = await selectVideoFile()
      if (file) {
        return loadVideoIntoTimeline({ file, trackIndex })
      }
      return Promise.resolve()
    },
    [selectVideoFile, loadVideoIntoTimeline]
  )

  return {
    selectedFile,
    selectedTrackIndex,
    useDefaultFile,
    defaultFileName,
    fileInputRef,
    handleFileChange,
    handleSelectClick,
    handleTrackIndexChange,
    selectVideoFile,
    loadVideoIntoTimeline,
    selectAndLoadVideo
  }
}
