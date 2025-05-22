import { useEffect, useState, useRef } from 'react'
import { useTranscript } from './hooks/use-transcript'

export function formatVTTTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const milliseconds = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 1000)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}.${String(milliseconds).padStart(3, '0')}`
}

export const wordsToVTT = (
  wordsArray: { word: string; start: number; end: number }[],
  options: { maxWordsPerCue?: number; maxCueDurationS?: number } = {}
) => {
  if (!wordsArray || wordsArray.length === 0) {
    return 'WEBVTT\n\n'
  }

  const { maxWordsPerCue = 15, maxCueDurationS = 7 } = options

  let vttContent = 'WEBVTT\n\n'
  let currentCueWords: string[] = []
  let cueStartTime: number = 0

  for (let i = 0; i < wordsArray.length; i++) {
    const wordInfo = wordsArray[i]

    const sanitizedWord = wordInfo.word.trim().replace(/\n/g, ' ').replace(/-->/g, '->')
    if (!sanitizedWord) continue

    if (currentCueWords.length === 0) {
      cueStartTime = wordInfo.start
    }

    const timedWord = `<${formatVTTTime(wordInfo.start)}>${sanitizedWord}`
    currentCueWords.push(timedWord)

    const isLastWordOverall = i === wordsArray.length - 1
    const currentCueOverallDuration = wordInfo.end - cueStartTime

    if (
      isLastWordOverall ||
      currentCueWords.length >= maxWordsPerCue ||
      (currentCueOverallDuration >= maxCueDurationS && currentCueWords.length > 0)
    ) {
      const cueEndTime = wordInfo.end
      vttContent += `${formatVTTTime(cueStartTime)} --> ${formatVTTTime(cueEndTime)}\n`
      vttContent += currentCueWords.join(' ') + '\n\n'

      currentCueWords = []
      cueStartTime = 0
    }
  }
  return vttContent
}

export const Transcript = () => {
  const { text, currentTime, seekToWord } = useTranscript()
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [highlightStyle, setHighlightStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0
  })

  useEffect(() => {
    if (currentTime === undefined) return

    const index = text.findIndex(word => {
      const buffer = 0.05
      return currentTime >= word.start - buffer && currentTime <= word.end + buffer
    })

    setActiveWordIndex(index !== -1 ? index : null)
  }, [currentTime, text])

  useEffect(() => {
    if (activeWordIndex === null) {
      setHighlightStyle(prev => ({ ...prev, opacity: 0 }))
      return
    }

    const wordElement = wordRefs.current[activeWordIndex]
    if (!wordElement) return

    const rect = wordElement.getBoundingClientRect()
    const parentRect = wordElement.parentElement?.getBoundingClientRect()

    if (!parentRect) return

    setHighlightStyle({
      left: rect.left - parentRect.left,
      top: rect.top - parentRect.top,
      width: rect.width,
      height: rect.height,
      opacity: 1
    })
  }, [activeWordIndex])

  useEffect(() => {
    wordRefs.current = wordRefs.current.slice(0, text.length)
  }, [text])

  return (
    <div className="p-4 w-96">
      <div className="relative">
        {/* Animated highlight rectangle */}
        <div
          className="absolute bg-black rounded-md pointer-events-none transition-all duration-120 ease-in-out z-0"
          style={{
            transform: `translate(${highlightStyle.left}px, ${highlightStyle.top}px)`,
            width: `${highlightStyle.width}px`,
            height: `${highlightStyle.height}px`,
            opacity: highlightStyle.opacity
          }}
        />

        {text.map(({ word, start, end }, index) => (
          <span
            title={`${formatVTTTime(start)} - ${formatVTTTime(end)}`}
            key={`${word}-${index}`}
            ref={el => {
              wordRefs.current[index] = el
            }}
            className="cursor-pointer inline-block px-0.5 relative z-10 transition-colors duration-120 ease-in-out"
            style={{
              color: activeWordIndex === index ? 'white' : 'black'
            }}
            onClick={() => {
              setActiveWordIndex(index)
              seekToWord(index, false)
            }}
          >
            {word}{' '}
          </span>
        ))}
      </div>
    </div>
  )
}
