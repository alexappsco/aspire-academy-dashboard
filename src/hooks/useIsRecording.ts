import { useMemo } from "react";
import { Constants, useMeeting } from "@videosdk.live/react-sdk";

/**
 * Hook to track if meeting recording is currently active
 * Returns true when recording is starting or already started
 * @returns boolean indicating if recording is in progress
 */
const useIsRecording = (): boolean => {
    const { recordingState } = useMeeting();

    const isRecording = useMemo(
        () =>
            recordingState === Constants.recordingEvents.RECORDING_STARTED ||
            recordingState === Constants.recordingEvents.RECORDING_STOPPING,
        [recordingState]
    );

    return isRecording;
};

export default useIsRecording;