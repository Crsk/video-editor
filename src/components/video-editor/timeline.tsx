import {
  PlayPauseControl,
  VideoLoopControl,
  TimeDisplay,
  SelectedVideoRenderSettingsControl,
  ZoomMinusControl,
  ZoomPlusControl,
  Timeline
} from 'index'

export const TimelineComponent = () => {
  return (
    <div className="flex h-full justify-center">
      <div className="w-full pr-7 pl-8">
        <div className="flex justify-between py-6 ml-[-8px] relative">
          <div className="flex gap-2">
            <PlayPauseControl />
            <VideoLoopControl classNames={{ active: 'text-brand-p3' }} />
          </div>
          <div className="flex justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <TimeDisplay />
          </div>
          <div className="flex gap-2">
            <SelectedVideoRenderSettingsControl />
            <ZoomMinusControl />
            <ZoomPlusControl />
          </div>
        </div>
        <div className="font-semibold w-full">
          <div>
            <Timeline
              styles={{
                root: '',
                timeMarker: {
                  handle: 'bg-brand-p3',
                  line: 'bg-brand-p3'
                },
                timeRuler: {
                  root: '',
                  label: 'text-xs text-foreground/70',
                  gridLines: ''
                },
                track: {
                  clip: {
                    root: '',
                    content: '',
                    active: {
                      root: 'bg-brand',
                      resizeHandle: '',
                      content: '',
                      dragOrResize: ''
                    }
                  },
                  root: ''
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
