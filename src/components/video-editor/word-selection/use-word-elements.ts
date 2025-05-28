import { useMemo } from 'react'
import { Word } from './types'
import { useWordSelection } from './word-selection-context'

type WordElementData = {
  word: Word
  index: number
  isSelected: boolean
  className: string
  selectionPosition?: 'first' | 'last' | 'middle'
}

export const useWordElements = () => {
  const { words, isWordSelected, isCurrentWord, isActiveSelection, selectedRange } = useWordSelection()
  const wordElementsData = useMemo(() => {
    let firstSelectedIndex = -1
    let lastSelectedIndex = -1

    words.forEach((_, index) => {
      if (isWordSelected(index)) {
        if (firstSelectedIndex === -1) firstSelectedIndex = index
        lastSelectedIndex = index
      }
    })

    return words.map((word, index) => {
      const isSelected = isWordSelected(index)
      let selectionPosition: 'first' | 'last' | 'middle' | undefined

      if (isSelected) {
        if (index === firstSelectedIndex && index === lastSelectedIndex) selectionPosition = 'first'
        else if (index === firstSelectedIndex) selectionPosition = 'first'
        else if (index === lastSelectedIndex) selectionPosition = 'last'
        else selectionPosition = 'middle'
      }

      // Determine if this word is part of the current active selection or a saved selection
      const isPartOfActiveSelection =
        isActiveSelection &&
        index >= firstSelectedIndex &&
        index <= lastSelectedIndex &&
        selectedRange.start <= index &&
        selectedRange.end >= index

      // Apply different styling for active selections vs saved highlights
      let className = `
          inline-block my-1 cursor-pointer transition-all duration-150 px-[3px]
          ${
            isCurrentWord(index)
              ? 'transform scale-105'
              : isPartOfActiveSelection
              ? 'transform scale-105' // Muted style for active selection
              : isSelected
              ? 'transform scale-105' // Yellow for saved highlights
              : 'hover:bg-subtle-xl hover:scale-105'
          }
          select-none
        `

      if (selectionPosition === 'first') {
        if (firstSelectedIndex === lastSelectedIndex) className += ' rounded'
        else className += ' rounded-l'
      } else if (selectionPosition === 'last') className += ' rounded-r'
      else if (selectionPosition === 'middle') className += ' rounded-none'
      else className += ' rounded'

      return {
        word,
        index,
        isSelected,
        selectionPosition,
        className
      } as WordElementData
    })
  }, [words, isWordSelected])

  return wordElementsData
}
