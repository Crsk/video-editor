import { useState, useCallback } from 'react'
import { Word, SelectionRange } from './types'

export const useWordSelection = (words: Word[]) => {
  const [selectedRange, setSelectedRange] = useState<SelectionRange>({ start: -1, end: -1 })
  const [dragStart, setDragStart] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [wasDragging, setWasDragging] = useState(false)

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
      return index >= selectedRange.start && index <= selectedRange.end && selectedRange.start !== -1
    },
    [selectedRange]
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

  return {
    selectedRange,
    dragStart,
    isDragging,
    wasDragging,
    setSelectedRange,
    setDragStart,
    setIsDragging,
    setWasDragging,
    clearSelection,
    selectRange,
    getSelectedText,
    isWordSelected,
    copySelection
  }
}
