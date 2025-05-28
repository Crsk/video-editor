import { useCallback, useMemo, useRef } from 'react'
import { WordSelectionProps } from './types'
import { WordSelectionProvider, useWordSelection } from './word-selection-context'
import { usePopover } from './use-popover'
import { useMouseInteractions } from './use-mouse-interactions'
import { useKeyboardInteractions } from './use-keyboard-interactions'
import { useWordElements } from './use-word-elements'
import { useSelectionChange } from './use-selection-change'
import { Popover, PopoverContent, PopoverAnchor } from '~/components/ui/popover'
import { XIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'

const WordSelectionContent = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { showPopover, popoverPosition, setShowPopover } = usePopover(containerRef)

  useSelectionChange()

  const { handleMouseDown, handleMouseEnter, handleMouseUp, handleWordClick, handleContainerClick } =
    useMouseInteractions()

  useKeyboardInteractions()

  const wordElementsData = useWordElements()
  const {
    words,
    savedSelections,
    deleteSelection,
    selectedRange,
    getSelectedText,
    onSelectionEnd,
    isActiveSelection,
    setIsActiveSelection
  } = useWordSelection()
  const { isCurrentWord } = useWordSelection()

  const handleSelection = useCallback(() => {
    if (selectedRange.start !== -1 && onSelectionEnd) onSelectionEnd(getSelectedText(), selectedRange)
    setIsActiveSelection(false)
    setShowPopover(false)
  }, [selectedRange, onSelectionEnd, getSelectedText, setShowPopover, setIsActiveSelection])

  const getWordStyle = useMemo(() => {
    return (index: number, isSelected: boolean) => {
      const isInActiveSelection = isActiveSelection && selectedRange.start <= index && selectedRange.end >= index
      const isCurrent = isCurrentWord(index)

      return {
        color: isCurrent
          ? 'var(--primary-foreground)'
          : isInActiveSelection
          ? 'var(--foreground)'
          : isSelected
          ? 'black'
          : 'inherit',

        backgroundColor: isCurrent
          ? 'var(--primary)'
          : isInActiveSelection
          ? 'var(--subtle-xl)'
          : isSelected
          ? 'var(--highlight)'
          : 'transparent',

        zIndex: isCurrent ? 10 : 'auto',
        position: 'relative' as const,
        padding: '2px 4px',
        margin: '2px 0px'
      }
    }
  }, [isActiveSelection, selectedRange, isCurrentWord])

  return (
    <div className="p-2 max-w-4xl mx-auto">
      <div
        ref={containerRef}
        className="relative"
        onMouseUp={handleMouseUp}
        onClick={handleContainerClick}
        onMouseLeave={handleMouseUp}
      >
        {wordElementsData.map(({ word, index, className, isSelected }) => (
          <span key={index}>
            <span
              className={className}
              onClick={e => handleWordClick(word, index, e)}
              onMouseDown={e => handleMouseDown(index, e)}
              onMouseEnter={() => handleMouseEnter(index)}
              role="button"
              tabIndex={0}
              aria-selected={isSelected}
              data-testid={`word-${index}`}
              style={getWordStyle(index, isSelected)}
            >
              {word.text}
            </span>
            {index < words.length - 1}
          </span>
        ))}

        <Popover open={showPopover}>
          {selectedRange.start !== -1 && selectedRange.end !== -1 && (
            <PopoverAnchor asChild>
              <span
                className="absolute"
                style={{
                  left: `${popoverPosition.x}px`,
                  top: `${popoverPosition.y}px`,
                  width: '1px',
                  height: '1px'
                }}
              />
            </PopoverAnchor>
          )}
          <PopoverContent side="top" align="center" sideOffset={5}>
            <Button className="focus-visible:ring-0" onClick={handleSelection}>
              Highlight
            </Button>
          </PopoverContent>
        </Popover>

        {savedSelections && savedSelections.length > 0 && (
          <div className="mt-8 space-y-2">
            <h3 className="text-sm font-medium">Highlights</h3>
            <div className="space-y-1">
              {savedSelections.map((selection, idx) => {
                const selectionText = words
                  .slice(selection.start, selection.end + 1)
                  .map(w => w.text)
                  .join(' ')
                return (
                  <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                    <span className="truncate flex-1">{selectionText}</span>
                    <button
                      onClick={() => deleteSelection?.(selection)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                      data-testid={`delete-selection-${idx}`}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const WordSelectionDemo = ({
  words,
  onWordClick,
  onSelectionChange,
  onSelectionEnd,
  savedSelections,
  onSelectionDelete,
  onSeekToWord,
  currentTime
}: WordSelectionProps & {
  onSeekToWord?: (index: number) => void
  currentTime?: number
}) => {
  return (
    <WordSelectionProvider
      words={words}
      onWordClick={onWordClick}
      onSelectionChange={onSelectionChange}
      onSelectionEnd={onSelectionEnd}
      savedSelections={savedSelections}
      onSelectionDelete={onSelectionDelete}
      onSeekToWord={onSeekToWord}
      currentTime={currentTime}
    >
      <WordSelectionContent />
    </WordSelectionProvider>
  )
}

export default WordSelectionDemo
