import { useEffect, useState, RefObject } from 'react'
import { useWordSelection } from './word-selection-context'

export const useCurrentWord = (containerRef: RefObject<HTMLDivElement | null>) => {
  const { currentWordIndex } = useWordSelection()
  const [highlightStyle, setHighlightStyle] = useState({
    transform: 'translate(0px, 0px)',
    width: '0px',
    height: '0px',
    opacity: 0,
    borderRadius: '5px'
  })

  useEffect(() => {
    if (currentWordIndex === null) {
      setHighlightStyle(prev => ({ ...prev, opacity: 0 }))
      return
    }

    const wordElement = document.querySelector(`[data-testid="word-${currentWordIndex}"]`) as HTMLElement
    if (!wordElement || !containerRef.current) return

    const rect = wordElement.getBoundingClientRect()
    const parentRect = containerRef.current.getBoundingClientRect()

    setHighlightStyle({
      transform: `translate(${rect.left - parentRect.left}px, ${rect.top - parentRect.top}px)`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      opacity: 1,
      borderRadius: '5px'
    })
  }, [currentWordIndex, containerRef])

  return { highlightStyle }
}
