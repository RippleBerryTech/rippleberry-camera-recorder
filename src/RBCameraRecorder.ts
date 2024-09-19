import ysFixWebmDuration from "fix-webm-duration"

export default class RBCameraRecorder {
  private mediaRecorder: MediaRecorder
  private options: IOptions
  private chunks: Blob[] = []
  private stream: MediaStream | null = null
  private videoElement: HTMLVideoElement | null = null
  private startTime: number = 0

  constructor(options?: IOptions) {
    this.options = options ?? {}
    this.options.mimeType =
      options?.mimeType ??
      `${bestSupportedMimeType("video")};${bestSupportedMimeType("audio")}`

    this.mediaRecorder = new MediaRecorder(new MediaStream(), {
      mimeType: this.options.mimeType,
      audioBitsPerSecond: this.options.audioBitsPerSecond ?? 128000,
      videoBitsPerSecond: this.options.videoBitsPerSecond ?? 2500000,
    })
  }

  private async getMediaDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      )
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      )
      return { videoDevices, audioDevices }
    } catch (error) {
      console.error("Error fetching media devices:", error)
      throw JSON.stringify({ message: "Unable to fetch media devices", error })
    }
  }

  isSupported() {
    const mimeType = this.options.mimeType ?? "Please provide a valid mimeType"
    const isSupported = MediaRecorder.isTypeSupported(mimeType)
    if (!isSupported) {
      console.error("Mime Type is not supported:", mimeType)
    }
    return isSupported
  }

  async preview() {
    return new Promise(async (resolve, reject) => {
      if (!this.isSupported())
        return reject(JSON.stringify({ message: "Mime Type is not supported" }))
      if (this.mediaRecorder.state === "recording")
        return reject(
          JSON.stringify({ message: "Media Recorder is already recording" })
        )

      this.cleanupVideoElement()
      this.stopStream()
      this.createVideoElement()
      if (!this.videoElement) {
        return reject(
          JSON.stringify({ message: "Unable to create video element" })
        )
      }

      const constraints = this.getMediaConstraints()
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(
          constraints as any
        )
        this.videoElement.srcObject = this.stream
        await this.videoElement.play()
        resolve(this.stream)
      } catch (error) {
        console.error("Error accessing media devices:", error)
        reject(
          JSON.stringify({ message: "Unable to access media devices", error })
        )
      }
    })
  }

  async start() {
    return new Promise(async (resolve, reject) => {
      if (!this.isSupported())
        return reject(JSON.stringify({ message: "Mime Type is not supported" }))
      if (this.mediaRecorder.state === "recording")
        return reject(
          JSON.stringify({ message: "Media Recorder is already recording" })
        )

      this.cleanupVideoElement()
      this.stopStream()
      this.createVideoElement()
      if (!this.videoElement) {
        return reject(
          JSON.stringify({ message: "Unable to create video element" })
        )
      }

      const constraints = this.getMediaConstraints()
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(
          constraints as any
        )
        this.videoElement.srcObject = this.stream
        await this.videoElement.play()

        this.startTime = Date.now()
        this.mediaRecorder = new MediaRecorder(this.stream, {
          mimeType: this.options.mimeType,
          audioBitsPerSecond: this.options.audioBitsPerSecond,
          videoBitsPerSecond: this.options.videoBitsPerSecond,
        })

        this.mediaRecorder.ondataavailable = (e) => {
          this.chunks.push(e.data)
        }

        this.mediaRecorder.onstart = () => resolve(this.stream)
        this.mediaRecorder.onerror = (e) => {
          this.cleanupVideoElement()
          console.error("MediaRecorder error:", e)
          reject(e)
        }

        this.mediaRecorder.start()
      } catch (error) {
        console.error("Error accessing media devices:", error)
        reject(
          JSON.stringify({ message: "Unable to access media devices", error })
        )
      }
    })
  }

  private stopStream() {
    this.stream?.getTracks().forEach((track) => track.stop())
  }

  private cleanupVideoElement() {
    if (this.videoElement) {
      this.videoElement.srcObject = null
      this.videoElement.remove()
      this.videoElement = null
    }
  }

  private createVideoElement() {
    const videoElement = document.createElement("video")
    videoElement.style.display = "none"
    document.body.appendChild(videoElement)
    this.videoElement = videoElement
  }

  private getMediaConstraints() {
    return {
      video: this.options.video?.deviceId
        ? {
            deviceId: { exact: this.options.video.deviceId },
            width: this.options.video.width ?? {
              min: 640,
              ideal: 1280,
              max: 2048,
            },
            height: this.options.video.height ?? {
              min: 480,
              ideal: 720,
              max: 1080,
            },
            frameRate: this.options.video.frameRate ?? { ideal: 30, max: 60 },
          }
        : {
            width: { min: 640, ideal: 1280, max: 2048 },
            height: { min: 480, ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
          },
      audio: {
        deviceId: this.options.audio?.deviceId
          ? { exact: this.options.audio.deviceId }
          : true,
      },
    }
  }

  async stop() {
    return new Promise((resolve, reject) => {
      this.mediaRecorder.onstop = async () => {
        this.stopStream()
        this.cleanupVideoElement()

        const duration = Date.now() - this.startTime
        const blob = new Blob(this.chunks, {
          type: this.chunks[0]?.type || "video/webm",
        })

        try {
          if (this.chunks[0]?.type.includes("webm")) {
            const fixedBlob = await ysFixWebmDuration(blob, duration, {
              logger: false,
            })
            resolve(fixedBlob)
          } else {
            resolve(blob)
          }
        } catch (error) {
          console.error("Error fixing blob duration:", error)
          reject(
            JSON.stringify({ message: "Error fixing blob duration", error })
          )
        }

        this.releaseMemory()
      }

      try {
        this.mediaRecorder.stop()
      } catch (error) {
        console.error("Error stopping media recorder:", error)
        reject(
          JSON.stringify({ message: "Error stopping media recorder", error })
        )
      }
    })
  }

  private releaseMemory() {
    this.chunks = []
    this.stream = null
    this.videoElement = null
    this.startTime = 0
  }

  getSupportedVideosOptions() {
    return supportedVideos
  }

  getSupportedAudiosOptions() {
    return supportedAudios
  }

  async getConnectedDevices() {
    if (this.isSupported()) {
      return await this.getMediaDevices()
    } else {
      throw JSON.stringify({ message: "Mime Type is not supported" })
    }
  }
}

function getSupportedMimeTypes(
  media: "video" | "audio",
  types: string[],
  codecs: string[]
) {
  const isSupported = MediaRecorder.isTypeSupported
  const supported: string[] = []

  types.forEach((type) => {
    const mimeType = `${media}/${type}`
    codecs.forEach((codec) => {
      const variations = [
        `${mimeType};codecs=${codec}`,
        `${mimeType};codecs=${codec.toUpperCase()}`,
      ]
      variations.forEach((variation) => {
        if (isSupported(variation)) supported.push(variation)
      })
    })
    if (isSupported(mimeType)) supported.push(mimeType)
  })

  return supported
}

const videoTypes = ["webm", "mp4", "ogg", "x-matroska"]
const audioTypes = ["webm", "mp3", "ogg", "x-matroska"]
const codecs = [
  "should-not-be-supported",
  "vp8",
  "vp8.0",
  "h264",
  "h.264",
  "h265",
  "h.265",
  "mpeg",
  "mp4a",
  "avc1",
  "av1",
  "opus",
  "pcm",
  "aac",
  "vp9",
  "vp9.0",
]

export const supportedVideos = getSupportedMimeTypes(
  "video",
  videoTypes,
  codecs
)
export const supportedAudios = getSupportedMimeTypes(
  "audio",
  audioTypes,
  codecs
)

export const bestSupportedMimeType = (media: "video" | "audio") => {
  const supported = media === "video" ? supportedVideos : supportedAudios
  return supported[0]
}

export async function closeStream(stream: MediaStream | null | undefined) {
  if (!stream) return
  stream.getTracks().forEach((track) => {
    track.stop()
  })
}

export interface IOptions {
  audioBitsPerSecond?: number
  videoBitsPerSecond?: number
  mimeType?: string
  video?: {
    width?: number | { min?: number; ideal: number; max?: number }
    height?: number | { min?: number; ideal: number; max?: number }
    deviceId?: string
    frameRate?: number
  }
  audio?: {
    deviceId?: string
  }
}
