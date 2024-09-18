import ysFixWebmDuration from "fix-webm-duration"

export class RBMediaRecorder {
  //MediaRecorder : MediaRecorder Object
  private mediaRecorder: MediaRecorder
  //Options : Options for the Recorder
  private options: IOptions
  //Chunks : Array of Chunks

  // <STATES>

  private chunks: Blob[] = []
  //stream : MediaStream | null = null
  private stream: MediaStream | null = null
  //videoElement : HTMLVideoElement
  private videoElement: HTMLVideoElement | null = null
  // startTime : Start Time of the Recorder
  private startTime: number = 0

  constructor(options?: IOptions) {
    this.options = options ?? {}
    this.options.mimeType =
      options?.mimeType ??
      `${bestSupportedMimeType("video")};${bestSupportedMimeType("audio")}`
    this.mediaRecorder = new MediaRecorder(new MediaStream(), {
      mimeType:
        options?.mimeType ??
        `${bestSupportedMimeType("video")};${bestSupportedMimeType("audio")}`,
      audioBitsPerSecond: options?.audioBitsPerSecond ?? 128000,
      videoBitsPerSecond: options?.videoBitsPerSecond ?? 2500000,
    })
  }

  protected async getMediaDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    )
    const audioDevices = devices.filter(
      (device) => device.kind === "audioinput"
    )
    return { videoDevices, audioDevices }
  }

  isSupported() {
    if (
      MediaRecorder.isTypeSupported(
        this.options.mimeType ?? "Please provide a valid mimeType"
      )
    ) {
      return true
    } else {
      console.error("Mime Type is not supported")
      return false
    }
  }

  async start() {
    return new Promise(async (resolve, reject) => {
      if (this.videoElement) return reject("Already Recording")
      var videoElement = document.createElement("video")
      this.videoElement = videoElement
      videoElement = document.createElement("video")
      videoElement.style.display = "none"
      document.body.appendChild(videoElement)

      const constraints = {
        video: this.options?.video?.deviceId
          ? {
              deviceId: this.options.video.deviceId
                ? { exact: this.options.video.deviceId }
                : true,
              width: this.options.video.width ?? {
                min: 640,
                ideal: 1280,
                max: 2048,
              }, // Width range (640p to 2K)
              height: this.options.video.height ?? {
                min: 480,
                ideal: 720,
                max: 1080,
              }, // Height range (480p to 2K)
              frameRate: this.options.video.frameRate ?? { ideal: 30, max: 60 }, // Frame rate range
            }
          : {
              width: { min: 640, ideal: 1280, max: 2048 }, // Width range (640p to 2K)
              height: { min: 480, ideal: 720, max: 1080 }, // Height range (480p to 2K)
              frameRate: { ideal: 30, max: 60 }, // Frame rate range
            },
        audio: {
          deviceId: this.options?.audio?.deviceId
            ? { exact: this.options.audio.deviceId }
            : true,
        },
      }

      const stream = await navigator.mediaDevices
        .getUserMedia(constraints as any)
        .then(async (stream) => {
          this.stream = stream
          return stream
        })
        .catch((e) => {
          console.error(e)
          reject(e)
        })
      if (!stream) return
      videoElement.srcObject = stream
      await videoElement.play()
      const startTime = Date.now()
      this.startTime = startTime
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.options.mimeType,
        audioBitsPerSecond: this.options.audioBitsPerSecond,
        videoBitsPerSecond: this.options.videoBitsPerSecond,
      })

      this.mediaRecorder.ondataavailable = (e) => {
        this.chunks.push(e.data)
      }
      this.mediaRecorder.onstart = () => {
        resolve(this.stream)
      }

      this.mediaRecorder.onerror = (e) => {
        // remove video element
        this.videoElement = null
        videoElement.remove()
        reject(e)
      }
      this.mediaRecorder.start()
    })
  }

  private stopStream() {
    this.stream?.getTracks().forEach((track) => track.stop())
  }

  private releaseMemory() {
    this.chunks = []
    this.stream = null
    this.videoElement = null
    this.startTime = 0
  }

  async stop() {
    return new Promise((resolve, reject) => {
      //Close Media Recorder
      this.mediaRecorder.stop()

      // Close Recorder Listener
      this.mediaRecorder.onstop = () => {
        //CLose All Streams
        this.stopStream()
        //Remove Video Element
        if (!this.videoElement) return reject("Video Element not found")
        this.videoElement.srcObject = null
        this.videoElement.remove()
        //Fix Blob Duration
        var duration = Date.now() - this.startTime
        var blob = new Blob(this.chunks, { type: this.chunks[0].type })
        if (this.chunks[0].type.includes("webm")) {
          ysFixWebmDuration(blob, duration, { logger: false }).then(
            (fixedBlob) => {
              blob = fixedBlob
            }
          )
        }
        this.releaseMemory()
        resolve(blob)
      }
    })
  }

  // Extra Information of Media Recorder
  getSupportedVideosOptions() {
    return supportedVideos
  }
  getSupportedAudiosOptions() {
    return supportedAudios
  }

  async getConnectedDevices() {
    if (this.isSupported()) {
      return await this.getMediaDevices().then((res) => res)
    } else {
      throw new Error("Mime Type is not supported")
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
    codecs.forEach((codec) =>
      [
        `${mimeType};codecs=${codec}`,
        `${mimeType};codecs=${codec.toUpperCase()}`,
        // /!\ false positive /!\
        // `${mimeType};codecs:${codec}`,
        // `${mimeType};codecs:${codec.toUpperCase()}`
      ].forEach((variation) => {
        if (isSupported(variation)) supported.push(variation)
      })
    )
    if (isSupported(mimeType)) supported.push(mimeType)
  })
  return supported
}
//MimeTypes.ts
// <!--Check Supported Video and Audio Recording Api of Brower-->
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
//utils.ts

// export async function closeStream(stream: MediaStream | null | undefined) {
//   if (!stream) return
//   //   stream.getTracks().forEach((track) => track.stop())
//   if (stream.getVideoTracks && stream.getAudioTracks) {
//     stream.getVideoTracks().map((track) => {
//       stream.removeTrack(track)
//       track.stop()
//     })
//     stream.getAudioTracks().map((track) => {
//       stream.removeTrack(track)
//       track.stop()
//     })
//   }
// }

export interface IOptions {
  audioBitsPerSecond?: number
  videoBitsPerSecond?: number
  mimeType?: string
  video?: {
    width?: number
    height?: number
    deviceId?: string
    frameRate?: number
  }
  audio?: {
    deviceId?: string
  }
}
