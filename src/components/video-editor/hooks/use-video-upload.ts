import { useState, useRef, ChangeEvent, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useEditor } from '../context/video-editor-provider'
import { useEvents } from '../context/events/events-context'
import { parseMedia } from '@remotion/media-parser'
import { LoadVideoIntoTimelineParams, UseVideoUploadReturn } from './use-video-upload.types'

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
    async ({ file, trackIndex, notify = true, words }: LoadVideoIntoTimelineParams): Promise<void> => {
      try {
        const src = typeof file === 'string' ? file : URL.createObjectURL(file)

        const { durationInSeconds } = await parseMedia({
          acknowledgeRemotionLicense: true,
          src: typeof file === 'string' ? file : file,
          fields: {
            durationInSeconds: true
          }
        })

        if (durationInSeconds === undefined || durationInSeconds === null)
          throw new Error('Failed to get video duration using media-parser')

        const FPS = 30
        const durationInFrames = Math.ceil(durationInSeconds * FPS)

        setTracks(prevTracks => {
          const newTracks = JSON.parse(JSON.stringify(prevTracks))
          const clips = newTracks[trackIndex].clips
          const newClipIndex = clips.length || 0
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
            src,
            words
          }

          newTracks[trackIndex].clips = [...newTracks[trackIndex].clips, newClip]
          if (file instanceof File && notify) notifyMediaLoaded({ trackIndex, clipIndex: newClipIndex, file, words })

          return newTracks
        })
      } catch (error) {
        console.error('Error loading video into timeline:', error)
        throw error
      }
    },
    [setTracks, notifyMediaLoaded]
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
      await loadVideoIntoTimeline({ file, trackIndex: selectedTrackIndex })
    }
  }

  const handleTrackIndexChange = (index: number) => {
    setSelectedTrackIndex(index)
  }

  const selectAndLoadVideo = useCallback(
    async (trackIndex: number = 0): Promise<void> => {
      const file = await selectVideoFile()
      if (file) return await loadVideoIntoTimeline({ file, trackIndex })
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
