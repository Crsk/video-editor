import { useState, useEffect, useCallback, useMemo } from 'react'
import { Word } from '../word-selection/types'

type UseTranscriptSyncProps = {
  words: Word[]
  currentTime?: number
  onWordSelect?: (index: number) => void
}

export const useTranscriptSync = ({ words, currentTime, onWordSelect }: UseTranscriptSyncProps) => {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null)

  useEffect(() => {
    if (currentTime === undefined) return

    const index = words.findIndex(word => {
      const buffer = 0.05
      return currentTime >= word.metadata.start - buffer && currentTime <= word.metadata.end + buffer
    })

    setActiveWordIndex(index !== -1 ? index : null)
  }, [currentTime, words])

  const handleWordClick = useCallback(
    (index: number) => {
      setActiveWordIndex(index)
      if (onWordSelect) {
        onWordSelect(index)
      }
    },
    [onWordSelect]
  )

  const isCurrentWord = (index: number) => useMemo(() => activeWordIndex === index, [activeWordIndex])

  return {
    activeWordIndex,
    handleWordClick,
    isCurrentWord
  }
}
