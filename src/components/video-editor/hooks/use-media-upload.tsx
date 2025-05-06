import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useEditor } from '../context/video-editor-provider'
import { Clip } from '../types'

export function useMediaUpload() {
  const { setTracks, tracks } = useEditor()

  const getTrackType = useCallback((trackIndex: number) => {
    if (trackIndex < 0 || trackIndex >= tracks.length) return 'generic'

    const track = tracks[trackIndex]
    if (track.clips.some((clip: Clip) => clip.type === 'video')) return 'video'
    if (track.clips.some((clip: Clip) => clip.type === 'audio')) return 'audio'
    return 'generic'
  }, [])

  const uploadMedia = useCallback(
    (trackIndex: number, file: File) => {
      if (!file) return

      setTracks(prevTracks => {
        const trackType = getTrackType(trackIndex)

        if (
          (trackType === 'video' && file.type !== 'video/mp4') ||
          (trackType === 'audio' && file.type !== 'audio/mpeg')
        ) {
          alert(`Please upload a ${trackType === 'video' ? 'MP4' : 'MP3'} file for this track.`)
          return prevTracks
        }

        const fileUrl = URL.createObjectURL(file)
        const newTracks = [...prevTracks]
        const track = newTracks[trackIndex]

        let startPosition = 0
        if (track.clips.length > 0) {
          const lastClip = track.clips[track.clips.length - 1]
          startPosition = lastClip.from + lastClip.durationInFrames
        }

        const newClip = {
          id: uuidv4(),
          from: startPosition,
          durationInFrames: 1, // This will be updated by the video/audio loader
          type: trackType === 'video' ? 'video' : 'audio',
          src: fileUrl,
          volume: 1
        } as const

        track.clips.push(newClip)

        return newTracks
      })
    },
    [setTracks, getTrackType]
  )

  const getAcceptedFileType = useCallback((trackType: 'video' | 'audio' | 'generic') => {
    return trackType === 'video' ? 'video/mp4' : trackType === 'audio' ? 'audio/mpeg' : ''
  }, [])

  const getUploadButtonPosition = useCallback((track: any, pixelsPerSecond: number, videoEndPosition: number) => {
    let endPosition = 0
    track.clips.forEach((clip: any) => {
      const clipEndPosition = (clip.from + clip.durationInFrames) * pixelsPerSecond
      if (clipEndPosition > endPosition) {
        endPosition = clipEndPosition
      }
    })

    endPosition += 4
    endPosition = videoEndPosition

    return endPosition
  }, [])

  return {
    uploadMedia,
    getTrackType,
    getAcceptedFileType,
    getUploadButtonPosition
  }
}
