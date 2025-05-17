import { useState, useRef, ChangeEvent, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useEditor } from '../context/video-editor-provider'
import { useEvents } from '../context/events/events-context'

export interface UseAudioUploadReturn {
  selectedFile: File | null
  selectedTrackIndex: number
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleSelectClick: () => Promise<void>
  handleTrackIndexChange: (index: number) => void
  selectAudioFile: () => Promise<File | null>
  loadAudioIntoTimeline: ({
    file,
    trackIndex,
    notify
  }: {
    file: File | string
    trackIndex: number
    notify?: boolean
  }) => Promise<void>
  selectAndLoadAudio: (trackIndex?: number) => Promise<void>
}

export function useAudioUpload(): UseAudioUploadReturn {
  const { setTracks } = useEditor()
  const { notifyMediaLoaded } = useEvents()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectAudioFile = useCallback((): Promise<File | null> => {
    return new Promise(resolve => {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'audio/*'
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

  const loadAudioIntoTimeline = useCallback(
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

          const audio = new Audio()
          audio.preload = 'metadata'
          audio.src = src

          audio.onloadedmetadata = () => {
            const FPS = 30
            const durationInSeconds = audio.duration
            const durationInFrames = Math.ceil(durationInSeconds * FPS)
            let clipIndex: number = -1

            setTracks(prevTracks => {
              const newTracks = JSON.parse(JSON.stringify(prevTracks))
              const clips = newTracks[trackIndex].clips
              const lastClipIndex = clips.length - 1
              clipIndex = lastClipIndex
              const lastClip = lastClipIndex >= 0 ? clips[lastClipIndex] : null
              const startFrame = lastClip ? lastClip.from + lastClip.durationInFrames : 0
              const newClipId = uuidv4()
              const newClip = {
                id: newClipId,
                from: startFrame,
                durationInFrames: durationInFrames,
                originalDuration: durationInFrames,
                type: 'audio',
                src,
                volume: 1
              }

              newTracks[trackIndex].clips = [...newTracks[trackIndex].clips, newClip]

              return newTracks
            })

            if (file instanceof File && notify) notifyMediaLoaded({ trackIndex, clipIndex, file })

            resolve()
          }

          audio.onerror = () => {
            reject(new Error('Failed to load audio'))
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
    }
  }

  const handleSelectClick = async () => {
    const file = await selectAudioFile()
    if (file) {
      setSelectedFile(file)
      loadAudioIntoTimeline({ file, trackIndex: selectedTrackIndex })
    }
  }

  const handleTrackIndexChange = (index: number) => {
    setSelectedTrackIndex(index)
  }

  const selectAndLoadAudio = useCallback(
    async (trackIndex: number = 0): Promise<void> => {
      const file = await selectAudioFile()
      if (file) {
        return loadAudioIntoTimeline({ file, trackIndex })
      }
      return Promise.resolve()
    },
    [selectAudioFile, loadAudioIntoTimeline]
  )

  return {
    selectedFile,
    selectedTrackIndex,
    fileInputRef,
    handleFileChange,
    handleSelectClick,
    handleTrackIndexChange,
    selectAudioFile,
    loadAudioIntoTimeline,
    selectAndLoadAudio
  }
}
