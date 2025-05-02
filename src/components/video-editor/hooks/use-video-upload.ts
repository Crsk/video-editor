import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useEditor } from '../context/video-editor-provider'

export function useVideoUpload() {
  const { setTracks } = useEditor()

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
    (file: File | string, trackIndex: number = 0): Promise<void> => {
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
              const items = newTracks[trackIndex].items
              const lastItemIndex = items.length - 1
              const lastItem = lastItemIndex >= 0 ? items[lastItemIndex] : null
              const startFrame = lastItem ? lastItem.from + lastItem.durationInFrames : 0
              const newItemId = uuidv4()
              const newItem = {
                id: newItemId,
                from: startFrame,
                durationInFrames: durationInFrames,
                originalDuration: durationInFrames,
                type: 'video',
                src
              }

              newTracks[trackIndex].items = [...newTracks[trackIndex].items, newItem]

              return newTracks
            })

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

  const selectAndLoadVideo = useCallback(
    async (trackIndex: number = 0): Promise<void> => {
      const file = await selectVideoFile()
      if (file) {
        return loadVideoIntoTimeline(file, trackIndex)
      }
      return Promise.resolve()
    },
    [selectVideoFile, loadVideoIntoTimeline]
  )

  return {
    selectVideoFile,
    loadVideoIntoTimeline,
    selectAndLoadVideo
  }
}
