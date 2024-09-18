export declare class RBMediaRecorder {
    private mediaRecorder;
    private options;
    private chunks;
    private stream;
    private videoElement;
    private startTime;
    constructor(options?: IOptions);
    protected getMediaDevices(): Promise<{
        videoDevices: MediaDeviceInfo[];
        audioDevices: MediaDeviceInfo[];
    }>;
    isSupported(): boolean;
    start(): Promise<unknown>;
    private stopStream;
    private releaseMemory;
    stop(): Promise<unknown>;
    getSupportedVideosOptions(): string[];
    getSupportedAudiosOptions(): string[];
    getConnectedDevices(): Promise<{
        videoDevices: MediaDeviceInfo[];
        audioDevices: MediaDeviceInfo[];
    }>;
}
export declare const supportedVideos: string[];
export declare const supportedAudios: string[];
export declare const bestSupportedMimeType: (media: "video" | "audio") => string;
export interface IOptions {
    audioBitsPerSecond?: number;
    videoBitsPerSecond?: number;
    mimeType?: string;
    video?: {
        width?: number;
        height?: number;
        deviceId?: string;
        frameRate?: number;
    };
    audio?: {
        deviceId?: string;
    };
}
