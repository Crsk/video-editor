import { useState, useCallback } from 'react'
import { useTranscript } from './hooks/use-transcript'
import { useCaptionTrackManager } from './captions/hooks/use-caption-track-manager'
import { useCaptionVTT } from './captions/hooks/use-caption-vtt'
import WordSelectionDemo from './word-selection/word-selection-demo'
import { SelectionRange, Word } from './word-selection/types'
import { Button } from '~/components/ui/button'

export const Transcript = () => {
  const { text, currentTime, seekToWord } = useTranscript()
  const { replaceAllCaptionTracks } = useCaptionTrackManager()
  const { downloadVTT } = useCaptionVTT()
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

  const handleCreateCaptionTrack = useCallback(() => {
    if (text.length === 0) {
      console.warn('No transcript available to create captions')
      return
    }

    const words = text.map(word => ({
      word: word.word,
      start: word.start,
      end: word.end
    }))

    replaceAllCaptionTracks(words)
  }, [text, replaceAllCaptionTracks])

  const handleDownloadVTT = useCallback(() => {
    if (text.length === 0) {
      console.warn('No transcript available to download VTT')
      return
    }

    const words = text.map(word => ({
      word: word.word,
      start: word.start,
      end: word.end
    }))

    downloadVTT(words, 'captions.vtt')
  }, [text, downloadVTT])

  return (
    <div className="p-4 w-full max-w-4xl overflow-y-auto">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Transcript</h3>
        {text.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={handleCreateCaptionTrack} variant="outline" size="sm" className="z-1000">
              Add Captions
            </Button>
            <Button onClick={handleDownloadVTT} variant="outline" size="sm" className="z-1000">
              Download Captions
            </Button>
          </div>
        )}
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
