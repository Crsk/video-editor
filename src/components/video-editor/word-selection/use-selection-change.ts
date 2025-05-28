import { useEffect } from 'react'
import { useWordSelection } from './word-selection-context'

export const useSelectionChange = () => {
  const { selectedRange, getSelectedText, onSelectionChange } = useWordSelection()
  useEffect(() => {
    if (onSelectionChange) onSelectionChange(getSelectedText(), selectedRange)
  }, [selectedRange, getSelectedText, onSelectionChange])
}
