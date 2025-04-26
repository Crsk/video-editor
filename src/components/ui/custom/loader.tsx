import { useState, useEffect } from 'react'
import { Text } from '~/components/ui/custom/text'

interface LoaderProps {
  phases: string[]
  duration?: number
  updateSpeed?: number
}

export const Loader = ({ phases, duration = 5000, updateSpeed = 60 }: LoaderProps) => {
  const [_, setProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(0)

  useEffect(() => {
    // Calculate increment per update to complete in the specified duration
    // For example, if duration is 5000ms and updateSpeed is 60ms, we need to increment by 0.12 each update
    const incrementPerUpdate = (100 * updateSpeed) / duration

    // Simulate progress
    const timer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(timer)
          return 100
        }

        // Update the phase based on progress
        const newPhase = Math.min(Math.floor(prevProgress / (100 / phases.length)), phases.length - 1)
        if (newPhase !== currentPhase) {
          setCurrentPhase(newPhase)
        }

        return prevProgress + incrementPerUpdate
      })
    }, updateSpeed)

    return () => clearInterval(timer)
  }, [currentPhase, phases.length, duration, updateSpeed])

  return (
    <div className="flex flex-col items-center justify-center text-foreground p-8 h-full w-full">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Processing</h2>
          <div className="text-center h-10">
            <Text size="P" level="secondary">
              {phases[currentPhase]}
            </Text>
          </div>
        </div>

        {/* Pulsing dots */}
        <div className="flex justify-center gap-2 mb-4">
          {[0, 300, 600].map((delay, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
