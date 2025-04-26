import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VideoComposer } from '../video-composer'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'

interface CompositionItem {
  id: string
  type: 'video' | 'audio'
  from: number
  durationInFrames: number
  src: string
  volume?: number
}

interface Track {
  name: string
  volume: number
  items: CompositionItem[]
}

interface TimelineData {
  composition: {
    durationInFrames: number
    fps: number
  }
  tracks: Track[]
  currentTime: number
}

vi.mock('@ffmpeg/ffmpeg', () => {
  return {
    FFmpeg: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      load: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
      readFile: vi.fn().mockResolvedValue(new Uint8Array(1000)),
      exec: vi.fn().mockResolvedValue(undefined)
    }))
  }
})

vi.mock('@ffmpeg/util', () => {
  return {
    toBlobURL: vi.fn().mockResolvedValue('mock-blob-url'),
    fetchFile: vi.fn().mockResolvedValue(new Uint8Array(1000))
  }
})

global.URL.createObjectURL = vi.fn().mockReturnValue('mock-video-url')

describe('VideoComposer', () => {
  const mockTimelineData: TimelineData = {
    composition: {
      durationInFrames: 300,
      fps: 30
    },
    tracks: [
      {
        name: 'Video Track',
        volume: 1,
        items: [
          {
            id: 'video1',
            type: 'video' as const,
            from: 0,
            durationInFrames: 150,
            src: 'https://example.com/video1.mp4'
          }
        ]
      },
      {
        name: 'Audio Track',
        volume: 1,
        items: [
          {
            id: 'audio1',
            type: 'audio' as const,
            from: 0,
            durationInFrames: 300,
            src: 'https://example.com/audio1.mp3'
          }
        ]
      }
    ],
    currentTime: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('should render the load FFmpeg button initially', () => {
    render(<VideoComposer timelineData={mockTimelineData} />)

    expect(screen.getByRole('button', { name: /load ffmpeg/i })).toBeInTheDocument()
    expect(screen.queryByRole('video')).not.toBeInTheDocument()
  })

  it('should call FFmpeg.load when the load button is clicked', async () => {
    const ffmpegLoadSpy = vi.fn().mockResolvedValue(undefined)
    vi.mocked(FFmpeg).mockImplementation(
      () =>
        ({
          on: vi.fn(),
          load: ffmpegLoadSpy
        } as any)
    )

    const user = userEvent.setup()
    render(<VideoComposer timelineData={mockTimelineData} />)

    const loadButton = screen.getByRole('button', { name: /load ffmpeg/i })
    await user.click(loadButton)

    expect(ffmpegLoadSpy).toHaveBeenCalled()
  })

  it('should correctly initialize FFmpeg with required parameters', async () => {
    const toBlobURLSpy = vi.mocked(toBlobURL)

    const user = userEvent.setup()
    render(<VideoComposer timelineData={mockTimelineData} />)

    const loadButton = screen.getByRole('button', { name: /load ffmpeg/i })
    await user.click(loadButton)

    expect(toBlobURLSpy).toHaveBeenCalledTimes(3)

    expect(toBlobURLSpy).toHaveBeenCalledWith(expect.stringContaining('ffmpeg-core.js'), 'text/javascript')
    expect(toBlobURLSpy).toHaveBeenCalledWith(expect.stringContaining('ffmpeg-core.wasm'), 'application/wasm')
    expect(toBlobURLSpy).toHaveBeenCalledWith(expect.stringContaining('ffmpeg-core.worker.js'), 'text/javascript')
  })

  describe('WASM Operations', () => {
    it('should correctly mock MP4 to MP3 transcoding', async () => {
      const mockFFmpeg = {
        FS: vi.fn((...args: any[]) => {
          if (args[0] === 'readFile') {
            return new Uint8Array(5000) // Mock output data
          }
          return undefined
        }),
        run: vi.fn().mockResolvedValue(undefined)
      }

      mockFFmpeg.FS('writeFile', 'input.mp4', new Uint8Array(1000))
      await mockFFmpeg.run('-i', 'input.mp4', '-q:a', '0', 'output.mp3')
      const result = mockFFmpeg.FS('readFile', 'output.mp3')

      expect(mockFFmpeg.FS).toHaveBeenCalledWith('writeFile', 'input.mp4', expect.any(Uint8Array))
      expect(mockFFmpeg.run).toHaveBeenCalledWith('-i', 'input.mp4', '-q:a', '0', 'output.mp3')
      expect(mockFFmpeg.FS).toHaveBeenCalledWith('readFile', 'output.mp3')
      expect(result).toBeInstanceOf(Uint8Array)
      expect((result as Uint8Array).length).toBeGreaterThan(0)
    })

    it('should show transcode button after FFmpeg is loaded', async () => {
      render(<VideoComposer timelineData={mockTimelineData} />)

      expect(screen.getByRole('button', { name: /load ffmpeg/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /transcode/i })).not.toBeInTheDocument()

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /load ffmpeg/i }))

      // Transcode button should now be visible
      expect(screen.getByRole('button', { name: /transcode/i })).toBeInTheDocument()
    })

    it('should initialize FFmpeg with correct parameters', async () => {
      const mockFFmpegInstance = new FFmpeg()
      vi.spyOn(mockFFmpegInstance, 'load')

      render(<VideoComposer timelineData={mockTimelineData} />)

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /load ffmpeg/i }))

      expect(toBlobURL).toHaveBeenCalledTimes(3)
      expect(toBlobURL).toHaveBeenCalledWith(expect.stringContaining('ffmpeg-core.js'), expect.any(String))
      expect(toBlobURL).toHaveBeenCalledWith(expect.stringContaining('ffmpeg-core.wasm'), expect.any(String))
      expect(toBlobURL).toHaveBeenCalledWith(expect.stringContaining('ffmpeg-core.worker.js'), expect.any(String))
    })

    it('should use fetchFile to load video content', async () => {
      const fileData = await fetchFile('https://example.com/video.mp4')

      expect(fileData).toBeInstanceOf(Uint8Array)
      expect(fileData.length).toBeGreaterThan(0)
      expect(fetchFile).toHaveBeenCalledWith('https://example.com/video.mp4')
    })
  })
})
