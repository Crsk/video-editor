import { useState, useCallback } from 'react'
import { useTranscript } from './hooks/use-transcript'
import WordSelectionDemo from './word-selection/word-selection-demo'
import { SelectionRange, Word } from './word-selection/types'
import { CaptionsSettings } from './captions-settings'

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
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Captions</h3>
        <CaptionsSettings />
      </div>

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
