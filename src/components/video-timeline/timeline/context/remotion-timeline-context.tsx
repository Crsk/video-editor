import { createContext, FC, ReactNode, useContext } from 'react'
import { useTimeline } from '../hooks/use-timeline'
import { useTimelineInteractions } from '../hooks/use-timeline-interactions'
import { useTimelineDnd } from '../hooks/use-timeline-dnd'

interface RemotionTimelineContextValue {
  timelineState: ReturnType<typeof useTimeline>
  timelineInteractions: ReturnType<typeof useTimelineInteractions>
  timelineDnd: ReturnType<typeof useTimelineDnd>
}

const RemotionTimelineContext = createContext<RemotionTimelineContextValue | undefined>(undefined)

export const RemotionTimelineProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const timelineState = useTimeline()
  const timelineInteractions = useTimelineInteractions(timelineState)
  const timelineDnd = useTimelineDnd(timelineState)

  return (
    <RemotionTimelineContext.Provider value={{ timelineState, timelineInteractions, timelineDnd }}>
      {children}
    </RemotionTimelineContext.Provider>
  )
}

export function useRemotionTimeline() {
  const ctx = useContext(RemotionTimelineContext)
  if (!ctx) throw new Error('useRemotionTimeline must be used within a RemotionTimelineProvider')

  return ctx
}
