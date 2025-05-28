import { useState, useEffect, RefObject, useCallback } from 'react'
import { useWordSelection } from './word-selection-context'

export const usePopover = (containerRef: RefObject<HTMLDivElement | null>) => {
  const { selectedRange, isDragging, clearSelection } = useWordSelection()
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const [showPopover, setShowPopover] = useState(false)

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (showPopover && containerRef.current) {
        const target = event.target as Node
        const isClickInsidePopover = document.querySelector('[data-slot="popover-content"]')?.contains(target)

        if (!isClickInsidePopover) {
          setShowPopover(false)
          clearSelection()
        }
      }
    },
    [showPopover, containerRef, clearSelection]
  )

  useEffect(() => {
    if (selectedRange.start !== -1 && !isDragging) {
      const container = containerRef.current
      if (container) {
        const words = container.querySelectorAll('span[role="button"]')
        if (words[selectedRange.end]) {
          const rect = words[selectedRange.end].getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          setPopoverPosition({
            x: rect.right - containerRect.left - rect.width / 2,
            y: rect.top - containerRect.top - 8
          })
          setShowPopover(true)
        }
      }
    } else {
      setShowPopover(false)
    }
  }, [selectedRange, isDragging, containerRef])

  useEffect(() => {
    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showPopover, handleClickOutside])

  return {
    popoverPosition,
    showPopover,
    setShowPopover
  }
}
