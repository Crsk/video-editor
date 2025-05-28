import { createContext, useContext, ReactNode, useMemo } from 'react'
import { useEditor } from './video-editor-provider'
import { VideoClip } from '../types'

export type TranscriptWord = {
  word: string
  start: number
  end: number
  clipId: string
  clipStart: number
  clipOffset: number
}

type TranscriptContextType = {
  text: TranscriptWord[]
  currentTime: number
  findWordAtTime: (time: number, bufferSeconds?: number) => TranscriptWord | null
  seekToWord: (wordIndex: number, shouldPause?: boolean) => boolean
}

const TranscriptContext = createContext<TranscriptContextType | undefined>(undefined)

export const TranscriptProvider = ({ children }: { children: ReactNode }) => {
  const { tracks, currentTime, handleTimeUpdate } = useEditor()

  const text = useMemo(() => {
    const wordsWithClipInfo: TranscriptWord[] = []
    const wordTimeMap = new Map<string, boolean>()

    tracks.forEach(track => {
      track.clips.forEach(clip => {
        if (clip.type === 'video' && (clip as VideoClip).words) {
          const videoClip = clip as VideoClip
          const clipStart = videoClip.from / 30 // Convert frames to seconds (FPS = 30)
          const clipOffset = videoClip.offset || 0

          videoClip.words?.forEach(word => {
            const adjustedStart = clipStart + (word.start - clipOffset / 30)
            const adjustedEnd = clipStart + (word.end - clipOffset / 30)

            const wordKey = `${word.word}_${adjustedStart.toFixed(3)}_${adjustedEnd.toFixed(3)}`

            if (!wordTimeMap.has(wordKey)) {
              wordTimeMap.set(wordKey, true)

              wordsWithClipInfo.push({
                word: word.word,
                start: adjustedStart,
                end: adjustedEnd,
                clipId: videoClip.id,
                clipStart: clipStart,
                clipOffset: clipOffset / 30
              })
            }
          })
        }
      })
    })

    // Sort words by their start time
    return wordsWithClipInfo.sort((a, b) => a.start - b.start)
  }, [tracks])

  const findWordAtTime = (time: number, bufferSeconds = 0.05) => {
    return text.find(word => time >= word.start - bufferSeconds && time <= word.end + bufferSeconds) || null
  }

  const seekToWord = (wordIndex: number, shouldPause = false) => {
    if (wordIndex >= 0 && wordIndex < text.length) {
      const word = text[wordIndex]
      const wordMidpoint = (word.start + word.end) / 2
      handleTimeUpdate(wordMidpoint, shouldPause)
      return true
    }
    return false
  }

  const value = {
    text,
    currentTime,
    findWordAtTime,
    seekToWord
  }

  return <TranscriptContext.Provider value={value}>{children}</TranscriptContext.Provider>
}

export const useTranscript = () => {
  const context = useContext(TranscriptContext)
  if (context === undefined) throw new Error('useTranscript must be used within a TranscriptProvider')

  return context
}
