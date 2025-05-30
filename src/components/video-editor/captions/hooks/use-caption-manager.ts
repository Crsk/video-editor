import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { WordTimestamp, CaptionStyle } from '../../types/caption.types'
import { CaptionClip } from '../../types'
import { useCaptionConfig } from './use-caption-config'

export const useCaptionManager = () => {
  const { createCaptionStyle, fps } = useCaptionConfig()

  const createCaptionClip = useCallback(
    (text: string, from: number, durationInFrames: number, styleOverrides?: Partial<CaptionStyle>): CaptionClip => {
      const style = createCaptionStyle(styleOverrides)

      return {
        id: uuidv4(),
        type: 'caption',
        from,
        durationInFrames,
        text,
        color: style.color,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        textAlign: style.textAlign,
        position: style.position,
        positionY: style.positionY
      }
    },
    [createCaptionStyle]
  )

  const createCaptionClipsFromWords = useCallback(
    (words: WordTimestamp[], styleOverrides?: Partial<CaptionStyle>): CaptionClip[] => {
      if (!words || words.length === 0) return []

      return words.map(word =>
        createCaptionClip(
          word.word,
          Math.round(word.start * fps),
          Math.round((word.end - word.start) * fps),
          styleOverrides
        )
      )
    },
    [createCaptionClip, fps]
  )

  const updateCaptionClipStyle = useCallback((clip: CaptionClip, styleUpdates: Partial<CaptionStyle>): CaptionClip => {
    return {
      ...clip,
      color: styleUpdates.color ?? clip.color,
      fontSize: styleUpdates.fontSize ?? clip.fontSize,
      fontWeight: styleUpdates.fontWeight ?? clip.fontWeight,
      textAlign: styleUpdates.textAlign ?? clip.textAlign,
      position: styleUpdates.position ?? clip.position,
      positionY: styleUpdates.positionY ?? clip.positionY
    }
  }, [])

  const processCaptionText = useCallback((text: string): string => {
    return text.trim().replace(/\n/g, ' ').replace(/-->/g, '->')
  }, [])

  const calculateWordTiming = useCallback(
    (
      clipStartInSeconds: number,
      clipOffset: number,
      wordStart: number,
      wordEnd: number
    ): { start: number; end: number } => {
      const adjustedStart = clipStartInSeconds + (wordStart - clipOffset)
      const adjustedEnd = clipStartInSeconds + (wordEnd - clipOffset)

      return {
        start: adjustedStart,
        end: adjustedEnd
      }
    },
    []
  )

  return {
    createCaptionClip,
    createCaptionClipsFromWords,
    updateCaptionClipStyle,
    processCaptionText,
    calculateWordTiming
  }
}
