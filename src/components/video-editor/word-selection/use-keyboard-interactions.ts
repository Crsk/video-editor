import { useCallback, useEffect } from 'react'
import { useWordSelection } from './word-selection-context'

export const useKeyboardInteractions = () => {
  const { words, selectedRange, clearSelection, selectRange, copySelection } = useWordSelection()
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedRange.start !== -1) await copySelection()
      if (e.key === 'Escape') clearSelection()
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        selectRange(0, words.length - 1)
      }
    },
    [selectedRange, copySelection, clearSelection, selectRange, words.length]
  )

  useEffect(() => {
    const listener = (e: KeyboardEvent) => handleKeyDown(e)
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [handleKeyDown])

  return { handleKeyDown }
}
