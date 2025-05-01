const FPS = 30

export const calculateMediaDuration = (src: string, type: 'video' | 'audio'): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    try {
      if (type === 'video') {
        const video = document.createElement('video')
        video.src = src

        video.onloadedmetadata = () => {
          const durationInSeconds = video.duration
          const durationInFrames = Math.ceil(durationInSeconds * FPS)
          resolve(durationInFrames)
        }

        video.onerror = () => {
          console.error('Error loading video for duration calculation')

          resolve(1) // Fallback to a default duration if loading fails
        }
      } else if (type === 'audio') {
        const audio = new Audio(src)

        audio.onloadedmetadata = () => {
          const durationInSeconds = audio.duration
          const durationInFrames = Math.ceil(durationInSeconds * FPS)
          resolve(durationInFrames)
        }

        audio.onerror = () => {
          console.error('Error loading audio for duration calculation')

          resolve(1) // Fallback to a default duration if loading fails
        }
      } else {
        reject(new Error('Invalid media type'))
      }
    } catch (error) {
      console.error('Error calculating media duration:', error)

      resolve(1) // Fallback to a default duration if an error occurs
    }
  })
}
