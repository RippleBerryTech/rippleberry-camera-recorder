import ysFixWebmDuration from "fix-webm-duration";
export class RBMediaRecorder {
    constructor(options) {
        var _a, _b, _c, _d;
        //Chunks : Array of Chunks
        // <STATES>
        this.chunks = [];
        //stream : MediaStream | null = null
        this.stream = null;
        //videoElement : HTMLVideoElement
        this.videoElement = null;
        // startTime : Start Time of the Recorder
        this.startTime = 0;
        this.options = options !== null && options !== void 0 ? options : {};
        this.options.mimeType =
            (_a = options === null || options === void 0 ? void 0 : options.mimeType) !== null && _a !== void 0 ? _a : `${bestSupportedMimeType("video")};${bestSupportedMimeType("audio")}`;
        this.mediaRecorder = new MediaRecorder(new MediaStream(), {
            mimeType: (_b = options === null || options === void 0 ? void 0 : options.mimeType) !== null && _b !== void 0 ? _b : `${bestSupportedMimeType("video")};${bestSupportedMimeType("audio")}`,
            audioBitsPerSecond: (_c = options === null || options === void 0 ? void 0 : options.audioBitsPerSecond) !== null && _c !== void 0 ? _c : 128000,
            videoBitsPerSecond: (_d = options === null || options === void 0 ? void 0 : options.videoBitsPerSecond) !== null && _d !== void 0 ? _d : 2500000,
        });
    }
    async getMediaDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        const audioDevices = devices.filter((device) => device.kind === "audioinput");
        return { videoDevices, audioDevices };
    }
    isSupported() {
        var _a;
        if (MediaRecorder.isTypeSupported((_a = this.options.mimeType) !== null && _a !== void 0 ? _a : "Please provide a valid mimeType")) {
            return true;
        }
        else {
            console.error("Mime Type is not supported");
            return false;
        }
    }
    async start() {
        return new Promise(async (resolve, reject) => {
            var _a, _b, _c, _d, _e, _f, _g;
            if (this.videoElement)
                return reject("Already Recording");
            var videoElement = document.createElement("video");
            this.videoElement = videoElement;
            videoElement = document.createElement("video");
            videoElement.style.display = "none";
            document.body.appendChild(videoElement);
            const constraints = {
                video: ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.video) === null || _b === void 0 ? void 0 : _b.deviceId)
                    ? {
                        deviceId: this.options.video.deviceId
                            ? { exact: this.options.video.deviceId }
                            : true,
                        width: (_c = this.options.video.width) !== null && _c !== void 0 ? _c : {
                            min: 640,
                            ideal: 1280,
                            max: 2048,
                        }, // Width range (640p to 2K)
                        height: (_d = this.options.video.height) !== null && _d !== void 0 ? _d : {
                            min: 480,
                            ideal: 720,
                            max: 1080,
                        }, // Height range (480p to 2K)
                        frameRate: (_e = this.options.video.frameRate) !== null && _e !== void 0 ? _e : { ideal: 30, max: 60 }, // Frame rate range
                    }
                    : {
                        width: { min: 640, ideal: 1280, max: 2048 }, // Width range (640p to 2K)
                        height: { min: 480, ideal: 720, max: 1080 }, // Height range (480p to 2K)
                        frameRate: { ideal: 30, max: 60 }, // Frame rate range
                    },
                audio: {
                    deviceId: ((_g = (_f = this.options) === null || _f === void 0 ? void 0 : _f.audio) === null || _g === void 0 ? void 0 : _g.deviceId)
                        ? { exact: this.options.audio.deviceId }
                        : true,
                },
            };
            const stream = await navigator.mediaDevices
                .getUserMedia(constraints)
                .then(async (stream) => {
                this.stream = stream;
                return stream;
            })
                .catch((e) => {
                console.error(e);
                reject(e);
            });
            if (!stream)
                return;
            videoElement.srcObject = stream;
            await videoElement.play();
            const startTime = Date.now();
            this.startTime = startTime;
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: this.options.mimeType,
                audioBitsPerSecond: this.options.audioBitsPerSecond,
                videoBitsPerSecond: this.options.videoBitsPerSecond,
            });
            this.mediaRecorder.ondataavailable = (e) => {
                this.chunks.push(e.data);
            };
            this.mediaRecorder.onstart = () => {
                resolve(this.stream);
            };
            this.mediaRecorder.onerror = (e) => {
                // remove video element
                this.videoElement = null;
                videoElement.remove();
                reject(e);
            };
            this.mediaRecorder.start();
        });
    }
    stopStream() {
        var _a;
        (_a = this.stream) === null || _a === void 0 ? void 0 : _a.getTracks().forEach((track) => track.stop());
    }
    releaseMemory() {
        this.chunks = [];
        this.stream = null;
        this.videoElement = null;
        this.startTime = 0;
    }
    async stop() {
        return new Promise((resolve, reject) => {
            //Close Media Recorder
            this.mediaRecorder.stop();
            // Close Recorder Listener
            this.mediaRecorder.onstop = () => {
                //CLose All Streams
                this.stopStream();
                //Remove Video Element
                if (!this.videoElement)
                    return reject("Video Element not found");
                this.videoElement.srcObject = null;
                this.videoElement.remove();
                //Fix Blob Duration
                var duration = Date.now() - this.startTime;
                var blob = new Blob(this.chunks, { type: this.chunks[0].type });
                if (this.chunks[0].type.includes("webm")) {
                    ysFixWebmDuration(blob, duration, { logger: false }).then((fixedBlob) => {
                        blob = fixedBlob;
                    });
                }
                this.releaseMemory();
                resolve(blob);
            };
        });
    }
    // Extra Information of Media Recorder
    getSupportedVideosOptions() {
        return supportedVideos;
    }
    getSupportedAudiosOptions() {
        return supportedAudios;
    }
    async getConnectedDevices() {
        if (this.isSupported()) {
            return await this.getMediaDevices().then((res) => res);
        }
        else {
            throw new Error("Mime Type is not supported");
        }
    }
}
function getSupportedMimeTypes(media, types, codecs) {
    const isSupported = MediaRecorder.isTypeSupported;
    const supported = [];
    types.forEach((type) => {
        const mimeType = `${media}/${type}`;
        codecs.forEach((codec) => [
            `${mimeType};codecs=${codec}`,
            `${mimeType};codecs=${codec.toUpperCase()}`,
            // /!\ false positive /!\
            // `${mimeType};codecs:${codec}`,
            // `${mimeType};codecs:${codec.toUpperCase()}`
        ].forEach((variation) => {
            if (isSupported(variation))
                supported.push(variation);
        }));
        if (isSupported(mimeType))
            supported.push(mimeType);
    });
    return supported;
}
//MimeTypes.ts
// <!--Check Supported Video and Audio Recording Api of Brower-->
const videoTypes = ["webm", "mp4", "ogg", "x-matroska"];
const audioTypes = ["webm", "mp3", "ogg", "x-matroska"];
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
];
export const supportedVideos = getSupportedMimeTypes("video", videoTypes, codecs);
export const supportedAudios = getSupportedMimeTypes("audio", audioTypes, codecs);
export const bestSupportedMimeType = (media) => {
    const supported = media === "video" ? supportedVideos : supportedAudios;
    return supported[0];
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUkJNZWRpYVJlY29yZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1JCTWVkaWFSZWNvcmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGlCQUFpQixNQUFNLG1CQUFtQixDQUFBO0FBRWpELE1BQU0sT0FBTyxlQUFlO0lBaUIxQixZQUFZLE9BQWtCOztRQVo5QiwwQkFBMEI7UUFFMUIsV0FBVztRQUVILFdBQU0sR0FBVyxFQUFFLENBQUE7UUFDM0Isb0NBQW9DO1FBQzVCLFdBQU0sR0FBdUIsSUFBSSxDQUFBO1FBQ3pDLGlDQUFpQztRQUN6QixpQkFBWSxHQUE0QixJQUFJLENBQUE7UUFDcEQseUNBQXlDO1FBQ2pDLGNBQVMsR0FBVyxDQUFDLENBQUE7UUFHM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLGFBQVAsT0FBTyxjQUFQLE9BQU8sR0FBSSxFQUFFLENBQUE7UUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRO1lBQ25CLE1BQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFFBQVEsbUNBQ2pCLEdBQUcscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQTtRQUN2RSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksV0FBVyxFQUFFLEVBQUU7WUFDeEQsUUFBUSxFQUNOLE1BQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFFBQVEsbUNBQ2pCLEdBQUcscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDdkUsa0JBQWtCLEVBQUUsTUFBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsa0JBQWtCLG1DQUFJLE1BQU07WUFDekQsa0JBQWtCLEVBQUUsTUFBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsa0JBQWtCLG1D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