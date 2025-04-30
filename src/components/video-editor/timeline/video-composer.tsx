import { RefObject, useCallback, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'
import { Button } from '~/components/ui/button'

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

interface VideoComposerProps {
  timelineData: TimelineData
}

export const VideoComposer: React.FC<VideoComposerProps> = ({ timelineData }) => {
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const ffmpegRef = useRef(new FFmpeg())
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const loadFFmpeg = useCallback(async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.9/dist/esm'
    const ffmpeg = ffmpegRef.current

    ffmpeg.on('log', ({ message }) => {
      console.log(message)
    })

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    })

    setFfmpegLoaded(true)
  }, [ffmpegRef])

  if (!ffmpegLoaded)
    return (
      <Button onClick={loadFFmpeg} className="mt-96">
        Load FFmpeg (test)
      </Button>
    )

  const writeVideoTrackItem = async ({ ffmpeg, id, file }: { ffmpeg: FFmpeg; id: string; file: string }) => {
    console.log(`[writeVideoTrackItem] | Writing track item ${id}`)
    await ffmpeg.writeFile(`${id}.mp4`, await fetchFile(file))
    console.log(`[writeVideoTrackItem] | Finished writing track item ${id}`)
  }

  const writeAudioTrackItem = async ({ ffmpeg, id, file }: { ffmpeg: FFmpeg; id: string; file: string }) => {
    console.log(`[writeAudioTrackItem] | Writing track item ${id}`)
    await ffmpeg.writeFile(`${id}.mp3`, await fetchFile(file))
    console.log(`[writeAudioTrackItem] | Finished writing track item ${id}`)
  }

  const trimTrackItem = async ({ ffmpeg, id, frames }: { ffmpeg: FFmpeg; id: string; frames: number }) => {
    console.log(`[trimTrackItem] | Trimming track item ${id}`)
    await ffmpeg.exec(['-i', `${id}.mp4`, '-frames:v', `${frames}`, '-c:a', 'copy', `${id}-trimmed.mp4`])
    console.log(`[trimTrackItem] | Finished trimming track item ${id}`)
  }

  const createItemId = ({ trackIndex, itemId }: { trackIndex: number; itemId: string }) =>
    `track-${trackIndex}_${itemId}`

  const concatVideos = async ({
    ffmpeg,
    concatList,
    concatListPath,
    videoOutputPath
  }: {
    ffmpeg: FFmpeg
    concatList: string
    concatListPath: string
    videoOutputPath: string
  }) => {
    console.log(`[concatVideos] | Concatenating videos from list`)
    await ffmpeg.writeFile(concatListPath, new TextEncoder().encode(concatList))
    await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', concatListPath, '-c', 'copy', videoOutputPath])
    console.log(`[concatVideos] | Finished concatenating videos from list`)
  }

  const mixAudio = async ({
    ffmpeg,
    audioPath,
    videoPath,
    outputPath
  }: {
    ffmpeg: FFmpeg
    audioPath: string
    videoPath: string
    outputPath: string
  }) => {
    console.log(`[mixAudio] | Mixing audio with video`, { audioPath, videoPath, outputPath })
    await ffmpeg.exec([
      '-stream_loop',
      '-1',
      '-i',
      audioPath,
      '-i',
      videoPath,
      '-filter_complex',
      '[1:a][0:a]amix=inputs=2:duration=first:dropout_transition=2[aout]',
      '-map',
      '1:v:0',
      '-map',
      '[aout]',
      '-shortest',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      outputPath
    ])
    console.log(`[mixAudio] | Finished mixing audio with video`)
  }

  const transcode = async ({
    tracks,
    ffmpeg,
    videoRef
  }: {
    tracks: Track[]
    ffmpeg: FFmpeg
    videoRef: RefObject<HTMLVideoElement | null>
  }) => {
    console.log(`[transcode] | Starting transcode`)
    console.log({ tracks })
    let audioPath = ''
    const videoConcatPath = 'video-concat.mp4'
    const audioVideoMixPath = 'mixed.mp4'
    let concatList = '' // "file 'video1-trimed.mp4'\nfile 'video2-trimed.mp4'\n..."
    const concatListPath = 'concat.txt'
    // const backgroundAudioPath = 'background-audio.mp3' // Supporting one background audio for now, TODO: should be able to merge multiple background audios

    for (const track of tracks) {
      const { items } = track

      for (const [index, item] of items.entries()) {
        const isAudio = item.type === 'audio'
        const itemId = createItemId({ trackIndex: index, itemId: item.id })

        if (isAudio) audioPath = `${itemId}.mp3`

        // Step 1: store track files in memory
        if (isAudio) await writeAudioTrackItem({ ffmpeg, id: itemId, file: item.src })
        else await writeVideoTrackItem({ ffmpeg, id: itemId, file: item.src })

        // Step 2: trim (TODO: validate to skip if not necessary)
        await trimTrackItem({ ffmpeg, id: itemId, frames: item.durationInFrames })

        // Step 3: build concat list
        concatList += `file '${createItemId({ trackIndex: index, itemId: item.id })}-trimmed.mp4'\n`
      }
    }

    // Step 3.1: concat from list
    await concatVideos({ ffmpeg, concatList, concatListPath, videoOutputPath: videoConcatPath })

    // Step 4: mix background audio with original video audio
    await mixAudio({ ffmpeg, audioPath, videoPath: videoConcatPath, outputPath: audioVideoMixPath })

    // Step 5: show video
    const fileData = await ffmpeg.readFile(audioVideoMixPath)
    const data = new Uint8Array(fileData as ArrayBuffer)
    if (videoRef.current) videoRef.current.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
    console.log(`[transcode] | Finished transcode`)
  }

  return (
    <div>
      <video ref={videoRef} controls />
      <Button
        onClick={() =>
          transcode({
            tracks: timelineData.tracks,
            ffmpeg: ffmpegRef.current,
            videoRef: videoRef
          })
        }
      >
        Transcode
      </Button>
    </div>
  )
}
