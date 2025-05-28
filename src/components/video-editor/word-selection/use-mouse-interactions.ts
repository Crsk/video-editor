import { useCallback, useEffect, useRef } from 'react'
import { MouseEvent } from 'react'
import { Word } from './types'
import { useWordSelection } from './word-selection-context'

const DRAG_CLEANUP_DELAY = 50
const DRAG_TOLERANCE_PX = 5

export const useMouseInteractions = () => {
  const mouseStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const toleranceExceededRef = useRef(false)

  const {
    selectedRange,
    dragStart,
    isDragging,
    wasDragging,
    setIsDragging,
    setWasDragging,
    setDragStart,
    selectRange,
    onWordClick,
    getSelectedText,
    seekToWord,
    setIsActiveSelection
  } = useWordSelection()
  const handleMouseDown = useCallback(
    (index: number, e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      mouseStartPosRef.current = { x: e.clientX, y: e.clientY }
      toleranceExceededRef.current = false

      setDragStart(index)
      setIsDragging(false)
    },
    [setDragStart, setIsDragging]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragStart === -1 || isDragging || toleranceExceededRef.current) return

      if (mouseStartPosRef.current) {
        const dx = Math.abs(e.clientX - mouseStartPosRef.current.x)
        const dy = Math.abs(e.clientY - mouseStartPosRef.current.y)
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > DRAG_TOLERANCE_PX) {
          toleranceExceededRef.current = true
          setIsDragging(true)
          setIsActiveSelection(true)
          selectRange(dragStart, dragStart)
        }
      }
    },
    [dragStart, isDragging, setIsDragging, selectRange]
  )

  // Add and remove the document-level mouse move listener
  useEffect(() => {
    if (dragStart !== -1 && !isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any)
      return () => document.removeEventListener('mousemove', handleMouseMove as any)
    }
  }, [dragStart, isDragging, handleMouseMove])

  const handleMouseEnter = useCallback(
    (index: number) => {
      if (dragStart === -1 || index === dragStart) return

      if (isDragging) {
        const start = Math.min(dragStart, index)
        const end = Math.max(dragStart, index)
        selectRange(start, end)
      }
    },
    [isDragging, dragStart, selectRange]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging && selectedRange.start !== -1) {
      setWasDragging(true)
      setTimeout(() => setWasDragging(false), DRAG_CLEANUP_DELAY)
      // Keep isActiveSelection true until the highlight button is clicked
    }

    setIsDragging(false)
    setDragStart(-1)
    toleranceExceededRef.current = false
  }, [isDragging, setIsDragging, setWasDragging, selectedRange, getSelectedText, setDragStart])

  const handleWordClick = useCallback(
    (word: Word, index: number, e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (wasDragging || isDragging) return

      if (e.shiftKey && selectedRange.start !== -1) {
        const start = Math.min(selectedRange.start, index)
        const end = Math.max(selectedRange.start, index)
        selectRange(start, end)
        return
      }

      if (!e.shiftKey) {
        if (onWordClick) onWordClick(word, index)
        seekToWord(index)
      }
    },
    [wasDragging, isDragging, selectedRange.start, selectRange, onWordClick, seekToWord]
  )

  const handleContainerClick = useCallback(() => {}, [])

  return {
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleWordClick,
    handleContainerClick
  }
}
