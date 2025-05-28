export type Word = {
  text: string
  metadata: {
    start: number
    end: number
  }
}

export type SelectionRange = {
  start: number
  end: number
}

export type WordSelectionProps = {
  words: Word[]
  onWordClick?: (word: Word, index: number) => void
  onSelectionChange?: (selectedText: string, range: SelectionRange) => void
  onSelectionEnd?: (selectedText: string, range: SelectionRange) => void
  onSelectionDelete?: (range: SelectionRange) => void
  savedSelections?: SelectionRange[]
}

export type CopyPopoverProps = {
  isVisible: boolean
  position: { x: number; y: number }
  onCopy: () => void
}
