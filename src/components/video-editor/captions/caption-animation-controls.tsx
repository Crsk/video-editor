import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { useCaptionAnimationContext } from '../context/caption-animation-provider'
import { CaptionAnimationType } from '../types/caption.types'

const ANIMATION_OPTIONS: Array<{ value: CaptionAnimationType; label: string; description: string }> = [
  {
    value: 'bounce',
    label: 'Bounce',
    description: 'Classic bounce entrance with smooth scaling'
  },
  {
    value: 'wave',
    label: 'Wave',
    description: 'Waves with dynamic scale and rotation based on duration'
  },
  {
    value: 'shake',
    label: 'Shake',
    description: 'High-frequency trembling effect with subtle rotation'
  },
  {
    value: 'zoom',
    label: 'Zoom',
    description: 'Dramatic zoom from tiny to large with spring physics'
  },
  {
    value: 'swing',
    label: 'Swing',
    description: 'Pendulum swing motion with dampening over time'
  },
  {
    value: 'elastic',
    label: 'Elastic',
    description: 'Overshoot entrance with elastic bounce settlement'
  },
  {
    value: 'glitch',
    label: 'Glitch',
    description: 'Chaos and mega distortions'
  }
]

export const CaptionAnimationControls: React.FC = () => {
  const { animationType, setAnimationType } = useCaptionAnimationContext()

  return (
    <div className="w-full max-w-md p-4 bg-background border border-border rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Caption Animation</h3>
        <p className="text-sm text-muted-foreground">Choose how your captions appear and animate</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="animation-select" className="text-sm font-medium text-foreground">
          Animation Type
        </label>
        <Select value={animationType} onValueChange={(value: CaptionAnimationType) => setAnimationType(value)}>
          <SelectTrigger id="animation-select" className="w-full">
            <SelectValue placeholder="Select animation type" />
          </SelectTrigger>
          <SelectContent>
            {ANIMATION_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Current: {ANIMATION_OPTIONS.find(opt => opt.value === animationType)?.label}
        </p>
      </div>
    </div>
  )
}
