import { FC, RefObject, useCallback, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'
import { Button } from '~/components/ui/button'
import { useCompositionData } from '../hooks/use-composition-data'
import { CompositionTrack } from '../types'

export const VideoComposer: FC = () => {
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const ffmpegRef = useRef(new FFmpeg())
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const compositionData = useCompositionData()

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

  const writeVideoClip = async ({ ffmpeg, id, file }: { ffmpeg: FFmpeg; id: string; file: string }) => {
    console.log(`[writeVideoClip] | Writing clip ${id}`)
    await ffmpeg.writeFile(`${id}.mp4`, await fetchFile(file))
    console.log(`[writeVideoClip] | Finished writing clip ${id}`)
  }

  const writeAudioClip = async ({ ffmpeg, id, file }: { ffmpeg: FFmpeg; id: string; file: string }) => {
    console.log(`[writeAudioClip] | Writing clip ${id}`)
    await ffmpeg.writeFile(`${id}.mp3`, await fetchFile(file))
    console.log(`[writeAudioClip] | Finished writing clip ${id}`)
  }

  const trimClip = async ({ ffmpeg, id, frames }: { ffmpeg: FFmpeg; id: string; frames: number }) => {
    console.log(`[trimClip] | Trimming clip ${id}`)
    await ffmpeg.exec(['-i', `${id}.mp4`, '-frames:v', `${frames}`, '-c:a', 'copy', `${id}-trimmed.mp4`])
    console.log(`[trimClip] | Finished trimming clip ${id}`)
  }

  const createClipId = ({ clipIndex, ClipId }: { clipIndex: number; ClipId: string }) => `clip-${clipIndex}_${ClipId}`

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
    tracks: CompositionTrack[]
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
      const { clips } = track

      for (const [index, clip] of clips.entries()) {
        const isAudio = clip.type === 'audio'
        const ClipId = createClipId({ clipIndex: index, ClipId: clip.id })

        if (isAudio) audioPath = `${ClipId}.mp3`

        // Step 1: store track files in memory
        if (isAudio) await writeAudioClip({ ffmpeg, id: ClipId, file: clip.src })
        else await writeVideoClip({ ffmpeg, id: ClipId, file: clip.src })

        // Step 2: trim (TODO: validate to skip if not necessary)
        await trimClip({ ffmpeg, id: ClipId, frames: clip.durationInFrames })

        // Step 3: build concat list
        concatList += `file '${createClipId({ clipIndex: index, ClipId: clip.id })}-trimmed.mp4'\n`
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
            tracks: compositionData.tracks,
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
