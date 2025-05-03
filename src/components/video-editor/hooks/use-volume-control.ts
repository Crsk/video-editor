import { useEditor } from '../context/video-editor-provider'
import { useRemotionTimeline } from '../timeline/context/remotion-timeline-context'
import { AudibleClip } from '../types'

export function useVolumeControl() {
  const { tracks, handleAudioClipVolumeChange } = useEditor()
  const { timelineState } = useRemotionTimeline()
  
  const getSelectedClip = (): AudibleClip | null => {
    const { selectedClip } = timelineState
    
    if (!selectedClip) return null
    
    const { clipIndex, ClipIndex } = selectedClip
    if (clipIndex < 0 || clipIndex >= tracks.length) return null
    
    const track = tracks[clipIndex]
    if (!track || ClipIndex < 0 || ClipIndex >= track.clips.length) return null
    
    const clip = track.clips[ClipIndex]
    const isAudible = clip.type === 'audio' || clip.type === 'video'
    
    if (!isAudible) return null
    
    return clip as AudibleClip
  }
  
  const updateVolume = (volume: number) => {
    const clip = getSelectedClip()
    if (!clip) return
    
    handleAudioClipVolumeChange(clip.id, volume)
  }
  
  return {
    getSelectedClip,
    updateVolume
  }
}
