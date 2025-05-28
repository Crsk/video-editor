import { createContext, useContext, ReactNode, useState, useCallback, useMemo, useEffect } from 'react'
import { Word, SelectionRange } from './types'
import { useTranscriptSync } from '../hooks/use-transcript-sync'

type WordSelectionContextType = {
  words: Word[]
  selectedRange: SelectionRange
  dragStart: number
  isDragging: boolean
  wasDragging: boolean
  currentWordIndex: number | null
  isActiveSelection: boolean
  setIsActiveSelection: (isActive: boolean) => void
  setSelectedRange: (range: SelectionRange) => void
  setDragStart: (index: number) => void
  setIsDragging: (isDragging: boolean) => void
  setWasDragging: (wasDragging: boolean) => void
  setCurrentWordIndex: (index: number | null) => void
  clearSelection: () => void
  selectRange: (start: number, end: number) => void
  getSelectedText: () => string
  isWordSelected: (index: number) => boolean
  isCurrentWord: (index: number) => boolean
  copySelection: () => Promise<boolean>
  seekToWord: (index: number) => void
  onWordClick?: (word: Word, index: number) => void
  onSelectionChange?: (selectedText: string, range: SelectionRange) => void
  onSelectionEnd?: (selectedText: string, range: SelectionRange) => void
  savedSelections?: SelectionRange[]
  deleteSelection?: (range: SelectionRange) => void
}

const WordSelectionContext = createContext<WordSelectionContextType | undefined>(undefined)

export const WordSelectionProvider = ({
  children,
  words,
  onWordClick,
  onSelectionChange,
  onSelectionEnd,
  savedSelections,
  onSelectionDelete,
  onSeekToWord,
  currentTime
}: {
  children: ReactNode
  words: Word[]
  onWordClick?: (word: Word, index: number) => void
  onSelectionChange?: (selectedText: string, range: SelectionRange) => void
  onSelectionEnd?: (selectedText: string, range: SelectionRange) => void
  savedSelections?: SelectionRange[]
  onSelectionDelete?: (range: SelectionRange) => void
  onSeekToWord?: (index: number) => void
  currentTime?: number
}) => {
  const [selectedRange, setSelectedRange] = useState<SelectionRange>({ start: -1, end: -1 })
  const [dragStart, setDragStart] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [wasDragging, setWasDragging] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null)
  const [appliedSelections, setAppliedSelections] = useState<SelectionRange[]>([])
  const [isActiveSelection, setIsActiveSelection] = useState(false)

  useEffect(() => {
    if (savedSelections && savedSelections.length > 0 && words.length > 0) {
      setAppliedSelections(savedSelections)
    }
  }, [savedSelections, words.length])

  const { activeWordIndex, handleWordClick: syncHandleWordClick } = useTranscriptSync({
    words,
    currentTime,
    onWordSelect: index => {
      if (onSeekToWord) {
        onSeekToWord(index)
      }
    }
  })

  useEffect(() => {
    setCurrentWordIndex(activeWordIndex)
  }, [activeWordIndex])

  const clearSelection = useCallback(() => {
    setSelectedRange({ start: -1, end: -1 })
    setDragStart(-1)
  }, [])

  const selectRange = useCallback(
    (start: number, end: number) => {
      const validStart = Math.max(0, Math.min(start, words.length - 1))
      const validEnd = Math.max(0, Math.min(end, words.length - 1))
      setSelectedRange({
        start: Math.min(validStart, validEnd),
        end: Math.max(validStart, validEnd)
      })
    },
    [words.length]
  )

  const getSelectedText = useCallback(() => {
    if (selectedRange.start === -1) return ''
    return words
      .slice(selectedRange.start, selectedRange.end + 1)
      .map(w => w.text)
      .join(' ')
  }, [selectedRange, words])

  const isWordSelected = useCallback(
    (index: number) => {
      if (index >= selectedRange.start && index <= selectedRange.end && selectedRange.start !== -1) return true

      return appliedSelections.some(range => index >= range.start && index <= range.end)
    },
    [selectedRange, appliedSelections]
  )

  const isCurrentWord = useCallback(
    (index: number) => {
      return currentWordIndex === index
    },
    [currentWordIndex]
  )

  const copySelection = useCallback(async () => {
    const text = getSelectedText()
    if (text) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (err) {
        console.error('Failed to copy:', err)
        return false
      }
    }
    return false
  }, [getSelectedText])

  const handleDeleteSelection = useCallback(
    (range: SelectionRange) => {
      if (onSelectionDelete) {
        onSelectionDelete(range)
        setAppliedSelections(prev => prev.filter(r => !(r.start === range.start && r.end === range.end)))

        if (selectedRange.start === range.start && selectedRange.end === range.end)
          setSelectedRange({ start: -1, end: -1 })
      }
    },
    [onSelectionDelete, selectedRange]
  )

  const seekToWord = useCallback(
    (index: number) => {
      syncHandleWordClick(index)
    },
    [syncHandleWordClick]
  )

  const value = useMemo(
    () => ({
      words,
      selectedRange,
      dragStart,
      isDragging,
      wasDragging,
      currentWordIndex,
      isActiveSelection,
      setSelectedRange,
      setDragStart,
      setIsDragging,
      setWasDragging,
      setCurrentWordIndex,
      setIsActiveSelection,
      clearSelection,
      selectRange,
      getSelectedText,
      isWordSelected,
      isCurrentWord,
      copySelection,
      seekToWord,
      onWordClick,
      onSelectionChange,
      onSelectionEnd,
      savedSelections: appliedSelections,
      deleteSelection: handleDeleteSelection
    }),
    [
      words,
      selectedRange,
      dragStart,
      isDragging,
      wasDragging,
      currentWordIndex,
      setSelectedRange,
      setDragStart,
      setIsDragging,
      setWasDragging,
      setCurrentWordIndex,
      clearSelection,
      selectRange,
      getSelectedText,
      isWordSelected,
      isCurrentWord,
      copySelection,
      seekToWord,
      onWordClick,
      onSelectionChange,
      onSelectionEnd,
      appliedSelections,
      handleDeleteSelection
    ]
  )

  return <WordSelectionContext.Provider value={value}>{children}</WordSelectionContext.Provider>
}

export const useWordSelection = () => {
  const context = useContext(WordSelectionContext)
  if (context === undefined) throw new Error('useWordSelection must be used within a WordSelectionProvider')

  return context
}
