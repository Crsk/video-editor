import { useState, useCallback } from 'react'
import { useTranscript } from './hooks/use-transcript'
import WordSelectionDemo from './word-selection/word-selection-demo'
import { SelectionRange, Word } from './word-selection/types'

export function formatVTTTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const milliseconds = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 1000)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}.${String(milliseconds).padStart(3, '0')}`
}

export const wordsToVTT = (
  wordsArray: { word: string; start: number; end: number }[],
  options: { maxWordsPerCue?: number; maxCueDurationS?: number } = {}
) => {
  if (!wordsArray || wordsArray.length === 0) {
    return 'WEBVTT\n\n'
  }

  const { maxWordsPerCue = 15, maxCueDurationS = 7 } = options

  let vttContent = 'WEBVTT\n\n'
  let currentCueWords: string[] = []
  let cueStartTime: number = 0

  for (let i = 0; i < wordsArray.length; i++) {
    const wordInfo = wordsArray[i]

    const sanitizedWord = wordInfo.word.trim().replace(/\n/g, ' ').replace(/-->/g, '->')
    if (!sanitizedWord) continue

    if (currentCueWords.length === 0) {
      cueStartTime = wordInfo.start
    }

    const timedWord = `<${formatVTTTime(wordInfo.start)}>${sanitizedWord}`
    currentCueWords.push(timedWord)

    const isLastWordOverall = i === wordsArray.length - 1
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
}

export const Transcript = () => {
  const { text, currentTime, seekToWord } = useTranscript()
  const [savedSelections, setSavedSelections] = useState<SelectionRange[]>([])

  const mappedWords: Word[] = text.map(word => ({
    text: word.word,
    metadata: {
      start: word.start,
      end: word.end
    }
  }))

  const handleWordClick = useCallback(
    (_: Word, index: number) => {
      seekToWord(index, false)
    },
    [seekToWord]
  )

  const handleSelectionEnd = useCallback((_: string, range: SelectionRange) => {
    setSavedSelections(prev => [...prev, range])
  }, [])

  const handleSelectionDelete = useCallback((range: SelectionRange) => {
    setSavedSelections(prev => prev.filter(r => !(r.start === range.start && r.end === range.end)))
  }, [])

  const handleSeekToWord = useCallback(
    (index: number) => {
      seekToWord(index, false)
    },
    [seekToWord]
  )

  return (
    <div className="p-4 w-full max-w-4xl overflow-y-auto">
      <WordSelectionDemo
        words={mappedWords}
        onWordClick={handleWordClick}
        onSelectionEnd={handleSelectionEnd}
        savedSelections={savedSelections}
        onSelectionDelete={handleSelectionDelete}
        onSeekToWord={handleSeekToWord}
        currentTime={currentTime}
      />
    </div>
  )
}
