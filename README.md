# RBMediaRecorder

RBMediaRecorder is a modern JavaScript library for recording audio and video using the MediaRecorder API. It provides an easy-to-use interface for capturing media, handling device selection, and ensuring compatibility across different browsers.

## Features

- **Cross-browser Support**: Automatically selects the best supported MIME type for audio and video.
- **Customizable Options**: Adjust video/audio quality and device selection.
- **Automatic Blob Duration Fix**: Fixes the duration of recorded WebM files.
- **Easy Integration**: Simple API for starting and stopping recordings.

## Installation

To install the package, use npm:

```bash
npm install fix-webm-duration
```

## Usage

### Import the Library

```javascript
import RBMediaRecorder from "fix-webm-duration"
```

### Initialize the Recorder

Create a new instance of `RBMediaRecorder` with optional configuration:

```javascript
const options = {
  mimeType: "video/webm; codecs=vp8, opus",
  audio: {
    deviceId: "your-audio-device-id",
  },
  video: {
    deviceId: "your-video-device-id",
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
}

const recorder = new RBMediaRecorder(options)
```

### Start Recording

Begin recording by calling the `start()` method:

```javascript
try {
  const stream = await recorder.start()
  console.log("Recording started", stream)
} catch (error) {
  console.error("Error starting recording", error)
}
```

### Stop Recording

To stop the recording and retrieve the media blob, call the `stop()` method:

```javascript
try {
  const blob = await recorder.stop()
  console.log("Recording stopped", blob)
  // You can now use the blob, e.g., save it or upload it.
} catch (error) {
  console.error("Error stopping recording", error)
}
```

### Check Device Compatibility

You can check if the selected MIME type is supported:

```javascript
if (recorder.isSupported()) {
  console.log("MIME type is supported")
} else {
  console.error("MIME type is not supported")
}
```

### Get Connected Media Devices

Retrieve a list of available audio and video devices:

```javascript
const devices = await recorder.getConnectedDevices()
console.log("Connected devices:", devices)
```

## Supported Options

### Options Structure

```typescript
interface IOptions {
  mimeType?: string
  audio?: {
    deviceId?: string
  }
  video?: {
    deviceId?: string
    width?: { min?: number; ideal?: number; max?: number }
    height?: { min?: number; ideal?: number; max?: number }
    frameRate?: { ideal?: number; max?: number }
  }
  audioBitsPerSecond?: number
  videoBitsPerSecond?: number
}
```

## Additional Methods

- `getSupportedVideosOptions()`: Retrieve a list of supported video options.
- `getSupportedAudiosOptions()`: Retrieve a list of supported audio options.

## Notes

- Ensure that your application has permissions to access the camera and microphone.
- Test the library in various browsers to confirm compatibility and performance.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

For any issues or feature requests, please open an issue in the GitHub repository.

---

Feel free to reach out if you have any questions or need assistance! Happy recording!
