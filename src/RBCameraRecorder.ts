import ysFixWebmDuration from "fix-webm-duration"

export default class RBMediaRecorder {
  // <! -------------  RBMediaRecorder Variable  ---------------!>
  //MediaRecorder : MediaRecorder Object
  private mediaRecorder: MediaRecorder
  //Options : Options for the Recorder
  private options: IOptions
  // <!--------------STATES---------------->
  //Chunks : Array of Chunks
  private chunks: Blob[] = []
  //stream : MediaStream | null = null
  private stream: MediaStream | null = null
  //videoElement : HTMLVideoElement
  private videoElement: HTMLVideoElement | null = null
  // startTime : Start Time of the Recorder
  private startTime: number = 0
  // <!--------------End STATES---------------->
  // <! -------------  End RBMediaRecorder Variable  ---------------!>

  // <! -------------  RBMediaRecorder Constructor  ---------------!>

  constructor(options?: IOptions) {
    this.options = options ?? {}
    this.options.mimeType =
      options?.mimeType ??
      (getSupportedVideosOptions()[0] && getSupportedAudiosOptions()[0])
        ? ""
        : `${getSupportedVideosOptions()[0]};${getSupportedAudiosOptions()[0]}`
    this.mediaRecorder = new MediaRecorder(new MediaStream(), {
      mimeType:
        options?.mimeType ??
        (getSupportedVideosOptions()[0] && getSupportedAudiosOptions()[0])
          ? ""
          : `${getSupportedVideosOptions()[0]};${
              getSupportedAudiosOptions()[0]
            }`,
      audioBitsPerSecond: options?.audioBitsPerSecond ?? 128000,
      videoBitsPerSecond: options?.videoBitsPerSecond ?? 2500000,
    })
  }
  // <! -------------  End RBMediaRecorder Constructor  ---------------!>

  // <! -------------  RBMediaRecorder Functions  ---------------!>

  public isSupported() {
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

  async getPreviewStream(): Promise<MediaStream> {
    return new Promise(async (resolve, reject) => {
      if (this.stream) {
        this.reset()
      }
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
      if (!stream) return reject("Stream not found")
      resolve(stream)
    })
  }

  async start(): Promise<MediaStream> {
    return new Promise(async (resolve, reject) => {
      if (this.videoElement || this.stream) return reject("Already Recording")
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
      if (!stream) return reject("Stream not found")
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
        if (this.stream) resolve(this.stream)
        else reject("Stream not found")
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

  public stopStream() {
    this.stream?.getTracks().forEach((track) => track.stop())
  }

  public reset() {
    this.chunks = []
    if (this.stream) {
      this.stopStream()
    }
    this.stream = null
    if (this.videoElement) {
      this.videoElement.srcObject = null
      this.videoElement.remove()
    }
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
        this.reset()
        resolve(blob)
      }
    })
  }

  async changeVideoDevice(deviceId: string) {
    this.options.video = { ...this.options.video, deviceId }
  }

  async changeAudioDevice(deviceId: string) {
    this.options.audio = { ...this.options.audio, deviceId }
  }
}

// <! -------------  End RBMediaRecorder Functions  ---------------!>

// <! -------------  RBMediaRecorder Utils  ---------------!>

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

// <! -------------  End RBMediaRecorder Utils  ---------------!>

// <! -------------  RBMediaRecorder MimeTypes  ---------------!>

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
      ].forEach((variation) => {
        if (isSupported(variation)) supported.push(variation)
      })
    )
    if (isSupported(mimeType)) supported.push(mimeType)
  })
  return supported
}

export function getSupportedVideosOptions() {
  return getSupportedMimeTypes("video", videoTypes, codecs) ?? []
}
export function getSupportedAudiosOptions() {
  return getSupportedMimeTypes("audio", audioTypes, codecs) ?? []
}

export async function getConnectedDevices(): Promise<{
  videoDevices: MediaDeviceInfo[]
  audioDevices: MediaDeviceInfo[]
}> {
  return await navigator.mediaDevices.enumerateDevices().then((devices) => {
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    )
    const audioDevices = devices.filter(
      (device) => device.kind === "audioinput"
    )
    return { videoDevices, audioDevices }
  })
}

export async function checkPermission(): Promise<{
  camera: boolean
  microphone: boolean
}> {
  const cameraPermission = await navigator.permissions
    .query({ name: "camera" as PermissionName })
    .then((result) => {
      return result.state === "granted"
    })
  const microphonePermission = await navigator.permissions
    .query({
      name: "microphone" as PermissionName,
    })
    .then((result) => {
      return result.state === "granted"
    })
  return {
    camera: cameraPermission,
    microphone: microphonePermission,
  }
}

export async function requestPermission(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    await navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        reject(false)
      })
  })
}

// <! -------------  End RBMediaRecorder MimeTypes  ---------------!>

//<! -------------  RBMediaRecorder Interfaces  ---------------!>
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
//<! -------------  End RBMediaRecorder Interfaces  ---------------!>
