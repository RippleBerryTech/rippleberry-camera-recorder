# Rippleberry Camera Recorder

`rippleberry-camera-recorder` is a powerful and easy-to-use JavaScript library for recording audio and video from user media devices. It provides a simple API for managing media streams, recording, and exporting blobs with various encoding options.

## Features

- **Cross-Browser Support**: Compatible with modern browsers.
- **Flexible Configuration**: Customize audio and video settings.
- **Easy Integration**: Quick setup for recording media.
- **Blob Fixing**: Automatically fixes WebM blob duration.
- **Device Management**: Retrieve available media devices.
- **Status Tracking**: Access the current status of the recorder (idle, previewing, recording).

## Installation

You can install the package via npm:

```javascript
npm install rippleberry-camera-recorder
```

## Usage

### Basic Setup

To get started, import the library and create an instance of the `RBCameraRecorder` class:

```javascript
import RBCameraRecorder from "rippleberry-camera-recorder"

// Creating a recorder instance with default options
const recorder = new RBCameraRecorder()
```

### Configuration Options

You can customize the recorder by providing options in the constructor. All options are optional.

```javascript
const recorder = new RBCameraRecorder({
  mimeType: "video/webm; codecs=vp8, opus", // Optional: Specify your desired mime type
  audio: {
    deviceId: "your-audio-device-id", // Optional: Specify audio device ID
  },
  video: {
    deviceId: "your-video-device-id", // Optional: Specify video device ID
    width: 1280, // Optional: Set video width
    height: 720, // Optional: Set video height
    frameRate: 30, // Optional: Set video frame rate
  },
  audioBitsPerSecond: 128000, // Optional: Set audio bit rate
  videoBitsPerSecond: 2500000, // Optional: Set video bit rate
})
```

### Accessing Status

You can access the current status of the recorder using the `status` property, which can be one of the following values: `idle`, `previewing`, or `recording`.

```javascript
console.log("Current status:", recorder.status) // Outputs the current status
```

### Recording Media

1. **Preview the Media:**
   Start by accessing the user's media devices and displaying a preview.

   ```javascript
   try {
     const stream = await recorder.preview()
     console.log("Preview started:", stream)
   } catch (error) {
     console.error("Error during preview:", JSON.parse(error))
   }
   ```

2. **Start Recording:**
   To start recording the media stream, call the `start` method.

   ```javascript
   try {
     const stream = await recorder.start()
     console.log("Recording started:", stream)
   } catch (error) {
     console.error("Error starting recording:", JSON.parse(error))
   }
   ```

3. **Stop Recording:**
   Once you're done recording, stop the media recorder.

   ```javascript
   try {
     const blob = await recorder.stop()
     console.log("Recording stopped. Blob:", blob)
   } catch (error) {
     console.error("Error stopping recording:", JSON.parse(error))
   }
   ```

### Getting Connected Devices

You can retrieve the list of available audio and video devices:

```javascript
try {
  const devices = await recorder.getConnectedDevices()
  console.log("Connected devices:", devices)
} catch (error) {
  console.error("Error fetching devices:", JSON.parse(error))
}
```

## Additional Methods

- `getSupportedVideosOptions()`: Retrieve a list of supported video options.
- `getSupportedAudiosOptions()`: Retrieve a list of supported audio options.

## Notes

- Ensure that your application has permissions to access the camera and microphone.
- Test the library in various browsers to confirm compatibility and performance.

## Example

Here’s a complete example demonstrating how to use the `rippleberry-camera-recorder`:

```javascript
import RBCameraRecorder from "rippleberry-camera-recorder"

const recorder = new RBCameraRecorder({
  mimeType: "video/webm; codecs=vp8, opus", // Optional configuration
})

async function startRecording() {
  try {
    await recorder.preview()
    console.log("Current status:", recorder.status) // Check status after preview
    const stream = await recorder.start()
    console.log("Recording started:", stream)
    console.log("Current status:", recorder.status) // Check status after starting recording

    // Stop recording after 10 seconds
    setTimeout(async () => {
      const blob = await recorder.stop()
      console.log("Recording stopped. Blob:", blob)
      console.log("Current status:", recorder.status) // Check status after stopping
    }, 10000)
  } catch (error) {
    console.error("An error occurred:", JSON.parse(error))
  }
}

startRecording()
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or report issues.

## Contact

For any inquiries or support, please contact [info@rippleberry.net].
