import { useEffect, useState, useRef } from 'react'
import { useEditor } from './context/video-editor-provider'

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
  // prettier-ignore
  const words = [{"word":"I","start":0,"end":0.14000000059604645},{"word":"launched","start":0.14000000059604645,"end":0.4000000059604645},{"word":"15","start":0.4000000059604645,"end":0.9599999785423279},{"word":"different","start":0.9599999785423279,"end":1.2599999904632568},{"word":"video","start":1.2599999904632568,"end":1.559999942779541},{"word":"ads","start":1.559999942779541,"end":1.7999999523162842},{"word":"last","start":1.7999999523162842,"end":2.0399999618530273},{"word":"week","start":2.0399999618530273,"end":2.299999952316284},{"word":"and","start":2.299999952316284,"end":2.5399999618530273},{"word":"found","start":2.5399999618530273,"end":2.700000047683716},{"word":"her","start":2.700000047683716,"end":2.859999895095825},{"word":"winner","start":2.859999895095825,"end":3.0799999237060547},{"word":"in","start":3.0799999237060547,"end":3.319999933242798},{"word":"just","start":3.319999933242798,"end":3.4600000381469727},{"word":"3","start":3.4600000381469727,"end":3.7200000286102295},{"word":"days.","start":3.7200000286102295,"end":4.460000038146973},{"word":"Discover","start":4.460000038146973,"end":4.820000171661377},{"word":"how","start":4.820000171661377,"end":5.239999771118164},{"word":"Silverance","start":5.239999771118164,"end":5.679999828338623},{"word":"customer","start":5.679999828338623,"end":6.079999923706055},{"word":"achieved","start":6.079999923706055,"end":6.400000095367432},{"word":"this.","start":6.400000095367432,"end":6.71999979019165}]
  const { currentTime, handleTimeUpdate } = useEditor()
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

    const index = words.findIndex(word => {
      const buffer = 0.05
      return currentTime >= word.start - buffer && currentTime <= word.end + buffer
    })

    setActiveWordIndex(index !== -1 ? index : null)
  }, [currentTime, words])

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
    wordRefs.current = wordRefs.current.slice(0, words.length)
  }, [words])

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

        {words.map(({ word, start, end }, index) => (
          <span
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
              const wordMidpoint = (start + end) / 2
              handleTimeUpdate(wordMidpoint)
            }}
          >
            {word}{' '}
          </span>
        ))}
      </div>
    </div>
  )
}
