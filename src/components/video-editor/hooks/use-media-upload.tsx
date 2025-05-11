import { useCallback } from 'react'
import { MediaType } from '../types'
import { useTrackManager } from '~/components/video-editor/hooks/use-track-manager'
import { useVideoUpload } from './use-video-upload'
import { useAudioUpload } from './use-audio-upload'

export function useMediaUpload() {
  const { getTrackType } = useTrackManager()
  const { loadVideoIntoTimeline } = useVideoUpload()
  const { loadAudioIntoTimeline } = useAudioUpload()

  const uploadMedia = useCallback(
    (trackIndex: number, file: File) => {
      if (!file) return

      const trackType = getTrackType(trackIndex)

      if (
        (trackType === 'video' && file.type !== 'video/mp4') ||
        (trackType === 'audio' && file.type !== 'audio/mpeg')
      ) {
        alert(`Please upload a ${trackType === 'video' ? 'MP4' : 'MP3'} file for this track.`)
        return
      }

      if (trackType === 'video' || file.type === 'video/mp4') {
        loadVideoIntoTimeline(file, trackIndex)
      } else if (trackType === 'audio' || file.type === 'audio/mpeg') {
        loadAudioIntoTimeline(file, trackIndex)
      }
    },
    [getTrackType, loadVideoIntoTimeline, loadAudioIntoTimeline]
  )

  const getAcceptedFileType = useCallback((trackType: MediaType | 'generic') => {
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
