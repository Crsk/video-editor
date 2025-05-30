import { useCallback } from 'react'
import { WordTimestamp } from '../../types/caption.types'

interface VTTOptions {
  maxWordsPerCue?: number
  maxCueDurationS?: number
}

export const useCaptionVTT = () => {
  const formatVTTTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const milliseconds = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 1000)

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}.${String(milliseconds).padStart(3, '0')}`
  }, [])

  const sanitizeVTTText = useCallback((text: string): string => {
    return text.trim().replace(/\n/g, ' ').replace(/-->/g, '->')
  }, [])

  const wordsToVTT = useCallback(
    (words: WordTimestamp[], options: VTTOptions = {}): string => {
      if (!words || words.length === 0) return 'WEBVTT\n\n'

      const { maxWordsPerCue = 15, maxCueDurationS = 7 } = options

      let vttContent = 'WEBVTT\n\n'
      let currentCueWords: string[] = []
      let cueStartTime: number = 0

      for (let i = 0; i < words.length; i++) {
        const wordInfo = words[i]

        const sanitizedWord = sanitizeVTTText(wordInfo.word)
        if (!sanitizedWord) continue

        if (currentCueWords.length === 0) cueStartTime = wordInfo.start

        const timedWord = `<${formatVTTTime(wordInfo.start)}>${sanitizedWord}`
        currentCueWords.push(timedWord)

        const isLastWordOverall = i === words.length - 1
        const currentCueOverallDuration = wordInfo.end - cueStartTime

        if (
          isLastWordOverall ||
          currentCueWords.length >= maxWordsPerCue ||
          (currentCueOverallDuration >= maxCueDurationS && currentCueWords.length > 0)
        ) {
          const cueEndTime = wordInfo.end
          vttContent += `${formatVTTTime(cueStartTime)} --> ${formatVTTTime(cueEndTime)}\n`
          vttContent += currentCueWords.join(' ') + '\n\n'

          currentCueWords = []
          cueStartTime = 0
        }
      }

      return vttContent
    },
    [formatVTTTime, sanitizeVTTText]
  )

  const downloadVTT = useCallback(
    (words: WordTimestamp[], filename: string = 'captions.vtt', options?: VTTOptions): void => {
      const vttContent = wordsToVTT(words, options)
      const blob = new Blob([vttContent], { type: 'text/vtt' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    [wordsToVTT]
  )

  return {
    formatVTTTime,
    sanitizeVTTText,
    wordsToVTT,
    downloadVTT
  }
}
