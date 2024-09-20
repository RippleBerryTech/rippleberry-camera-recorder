# 📷 RippleBerry Camera Recorder

**RippleBerry Camera Recorder** is a powerful, yet easy-to-use JavaScript library that allows developers to capture video and audio from connected media devices. Built on top of the native MediaRecorder API, this package simplifies the process of recording media streams in modern web applications.

---

## 🚀 Key Features

- **Multi-Device Support:** Seamlessly record from various audio and video devices.
- **Simple Configuration:** Easily customize video and audio settings with flexible options.
- **Built-in Permission Handling:** Automatically manage permissions for camera and microphone access.
- **Control Methods:** Intuitive methods for starting, stopping, and managing media recordings.
- **Cross-Browser/Platform Compatibility:** No need to worry about compatibility! It works smoothly on Android 📱, iOS 🍏, and Windows 💻.
- **Auto Duration Fixing:** Automatically fixes the duration for `webm` blobs, ensuring accurate recording length.

---

## 🛠️ Installation

Install the package using npm or yarn:

```bash
npm install rippleberry-camera-recorder
# or
yarn add rippleberry-camera-recorder
```

---

## 📖 Usage

### 1. Import the Library

Start by importing the necessary components from the package:

```javascript
import RBCameraRecorder, {
  getConnectedDevices,
  getSupportedVideosOptions,
  getSupportedAudiosOptions,
  checkPermission,
  requestPermission,
} from "rippleberry-camera-recorder"
```

### 2. Initializing the Recorder

You can initialize the recorder **with** or **without** options, depending on your use case.

#### **With Options:**

You can customize the recorder's behavior by passing an options object when initializing:

```javascript
const options = {
  video: {
    width: 1280,
    height: 720,
    deviceId: "your-video-device-id", // Optional
  },
  audio: {
    deviceId: "your-audio-device-id", // Optional
  },
  mimeType: "video/webm", // Optional
  audioBitsPerSecond: 128000, // Optional
  videoBitsPerSecond: 2500000, // Optional
}

const recorder = new RBCameraRecorder(options)
```

#### **Without Options:**

You can initialize the recorder without passing any specific options. This will use the default media devices and settings:

```javascript
const recorder = new RBCameraRecorder()
```

### 3. Handling Permissions

Before accessing the camera or microphone, ensure permissions are granted. RippleBerry makes it simple:

```javascript
const permissions = await checkPermission()
if (!permissions.camera || !permissions.microphone) {
  await requestPermission()
}
```

### 4. Get Connected Devices

To display or list all available audio and video devices:

```javascript
const { videoDevices, audioDevices } = await getConnectedDevices()
```

### 5. Preview the Video

You can preview the video stream before starting the recording. Simply attach the stream to a video element:

```javascript
const previewStream = await recorder.getPreviewStream()
videoElement.srcObject = previewStream
videoElement.play()
```

### 6. Start and Stop Recording

**To start recording:**

```javascript
const stream = await recorder.start()
// Optionally, use the stream to show the live video
```

**To stop recording:**

```javascript
const videoBlob = await recorder.stop()
// You now have a Blob containing the recorded media (e.g., for download or further processing)
```

---

## ⚙️ Optional Methods

### Changing Devices

**Switch Video Device:**

```javascript
await recorder.changeVideoDevice(newDeviceId)
```

**Switch Audio Device:**

```javascript
await recorder.changeAudioDevice(newDeviceId)
```

### Supported Configuration Options

**Get Supported Video Options:**

Retrieve all supported video settings like resolution, frame rate, etc.:

```javascript
const supportedVideoOptions = await getSupportedVideosOptions()
console.log(supportedVideoOptions)
```

**Get Supported Audio Options:**

Retrieve all supported audio settings such as bit rate, sample rate, etc.:

```javascript
const supportedAudioOptions = await getSupportedAudiosOptions()
console.log(supportedAudioOptions)
```

---

## 🧑‍💻 Example

Here’s a simple React example showing how to use the RippleBerry Camera Recorder:

```javascript
import React, { useRef, useState } from "react"
import RBCameraRecorder, {
  checkPermission,
  requestPermission,
} from "rippleberry-camera-recorder"

const App = () => {
  const [recorder, setRecorder] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const videoRef = useRef(null)

  const startRecording = async () => {
    if (!recorder) {
      const options = {
        /* your custom options */
      }
      const newRecorder = new RBCameraRecorder(options)
      setRecorder(newRecorder)
    }

    const stream = await recorder.start()
    videoRef.current.srcObject = stream
    setIsRecording(true)
  }

  const stopRecording = async () => {
    const blob = await recorder.stop()
    const url = URL.createObjectURL(blob)
    // Optionally download or save the video
    setIsRecording(false)
  }

  return (
    <div>
      <video ref={videoRef} controls />
      {!isRecording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
    </div>
  )
}

export default App
```

---

## 🔍 API Reference

### `RBCameraRecorder`

#### Constructor: `RBCameraRecorder(options?: IOptions)`

Creates a new instance of the recorder with specified configuration options.

#### Methods:

- **`isSupported(): boolean`**  
  Checks if the provided mime type is supported by the browser.

- **`getPreviewStream(): Promise<MediaStream>`**  
  Returns a media stream for previewing before recording starts.

- **`start(): Promise<MediaStream>`**  
  Starts the recording process and returns the media stream.

- **`stop(): Promise<Blob>`**  
  Stops the recording and returns the captured media as a `Blob`.

- **`reset(): void`**  
  Resets the recorder to its initial state.

- **`changeVideoDevice(deviceId: string): Promise<void>`**  
  Switches to a different video input device.

- **`changeAudioDevice(deviceId: string): Promise<void>`**  
  Switches to a different audio input device.

- **`getSupportedVideosOptions(): Promise<VideoOptions[]>`**  
  Retrieves a list of supported video configuration options.

- **`getSupportedAudiosOptions(): Promise<AudioOptions[]>`**  
  Retrieves a list of supported audio configuration options.

---

## 🌐 Cross-Browser and Platform Compatibility

RippleBerry Camera Recorder works across all modern browsers and platforms, ensuring seamless functionality on:

- **Android 📱**
- **iOS 🍏**
- **Windows 💻**

---

## 🎥 Demo

Check out the demo application at [Demo Link](#).

---

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for more details.

For issues, suggestions, or contributions, feel free to open an issue or submit a pull request in the repository!

---
