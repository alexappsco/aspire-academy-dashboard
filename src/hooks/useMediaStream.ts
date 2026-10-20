import { createCameraVideoTrack, createMicrophoneAudioTrack } from "@videosdk.live/react-sdk";

interface GetVideoTrackParams {
    webcamId?: string;
    encoderConfig?: string;
}

interface GetAudioTrackParams {
    micId?: string;
}

interface UseMediaStreamReturn {
    getVideoTrack: (params: GetVideoTrackParams) => Promise<MediaStream | null>;
    getAudioTrack: (params: GetAudioTrackParams) => Promise<MediaStream | null>;
}

/**
 * Hook to create video and audio tracks for media streaming
 * @returns Object containing functions to get video and audio tracks
 */
const useMediaStream = (): UseMediaStreamReturn => {
    const getVideoTrack = async ({ webcamId, encoderConfig }: GetVideoTrackParams): Promise<MediaStream | null> => {
        try {
            const track = await createCameraVideoTrack({
                cameraId: webcamId,
                encoderConfig: (encoderConfig || "h540p_w960p") as any,
                optimizationMode: "motion",
                multiStream: false,
            });
            return track;
        } catch (error) {
            console.error("Error creating video track:", error);
            return null;
        }
    };

    const getAudioTrack = async ({ micId }: GetAudioTrackParams): Promise<MediaStream | null> => {
        try {
            const track = await createMicrophoneAudioTrack({
                microphoneId: micId,
            });
            return track;
        } catch (error) {
            console.error("Error creating audio track:", error);
            return null;
        }
    };

    return { getVideoTrack, getAudioTrack };
};

export default useMediaStream;