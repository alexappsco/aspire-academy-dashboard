'use server';

import axiosInstance from '@/utils/axios';
import { endpoints } from '@/utils/endpoints';
import { cookies } from 'next/headers';
import { authToken, createMeeting as createVideoSdkRoom } from 'src/actions/sdk';
import { COOKIES_KEYS } from 'src/config-global';

const VIDEO_SDK_ROOM_ID = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/i;

// Types
export interface MeetingResponse {
  token: string | null;
  roomId: string | null;
  participantId?: string | null;
  participantName?: string | null;
  paidUntil?: string | null;
  hoursPerPeriod?: number | null;
  message?: string | null;
}

interface CreateMeetingParams {
  videoSessionId: string;
}

interface JoinMeetingParams {
  videoSessionId: string;
}

export async function getProfile(): Promise<{ name: string; id: string }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIES_KEYS.user)?.value;
  if (!raw) return { name: '', id: '' };

  try {
    const user = JSON.parse(raw) as { name?: string; id?: string };
    return { name: user.name ?? '', id: user.id ?? '' };
  } catch {
    return { name: '', id: '' };
  }
}


export const createMeeting = async ({
  videoSessionId,
}: CreateMeetingParams): Promise<MeetingResponse> => {
  console.log(`[API] Create is not used. Join session ${videoSessionId} instead.`);
  return {
    roomId: null,
    token: null,
    message: 'Create meeting is not available. Use join.',
  };
};
/**
 * Join an existing meeting room via backend
 * @param params - Object containing videoSessionId
 * @returns Meeting details (token and roomId) or error
 */
export const joinMeeting = async ({
  videoSessionId,
}: JoinMeetingParams): Promise<MeetingResponse> => {
  const url = endpoints.sdk.join(videoSessionId);
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  console.log(`[API Request] Joining meeting for session: ${videoSessionId}`, { url });

  try {
    const response = await axiosInstance.post(
      url,
      {}, // مهم جدًا
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const body = response as {
      roomId?: string;
      token?: string;
      participantId?: string;
      paidUntil?: string | null;
      hoursPerPeriod?: number | null;
      message?: string;
      data?: {
        roomId?: string;
        token?: string;
        participantId?: string;
        paidUntil?: string | null;
        hoursPerPeriod?: number | null;
        message?: string;
      };
    };
    const data = body?.roomId || body?.token ? body : body?.data;

    console.log("[API Response] Join meeting success:", data);

    if (data?.roomId && data?.token) {
      return {
        roomId: data.roomId,
        token: data.token,
        participantId: data.participantId ?? null,
        paidUntil: data.paidUntil ?? null,
        hoursPerPeriod: data.hoursPerPeriod ?? null,
        message: null,
      };
    } else {
      return {
        roomId: null,
        token: null,
        message: data?.message || "Invalid response from server",
      };
    }
  } catch (error: any) {
    console.error("[API Error] Joining meeting failed:", error);
    return {
      roomId: null,
      token: null,
      message: error.message || "Failed to join meeting",
    };
  }
};


/**
 * Notify backend that participant is leaving
 */
export const leaveMeetingAction = async (videoSessionId: string): Promise<void> => {
  console.log(`[API] Leave is local only for session: ${videoSessionId}`);
};

/**
 * Notify backend to end the meeting for all
 */
export const endMeetingAction = async (videoSessionId: string): Promise<void> => {
  const url = endpoints.sdk.end(videoSessionId);
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  try {
    await axiosInstance.post(url, {}, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });
    console.log(`[API] Meeting ended for session: ${videoSessionId}`);
  } catch (error) {
    console.error("[API Error] endMeetingAction failed:", error);
  }
};

// Keeping these for backward compatibility if needed, but they should be phased out
export const getToken = async () => {
  console.warn("getToken() is deprecated. Token is now provided by createMeeting/joinMeeting backend calls.");
  return undefined;
};

export const validateMeeting = async ({ roomId }: { roomId: string, token: string }) => {
  console.warn("validateMeeting() is deprecated. Validation is handled by the joinMeeting backend call.");
  return { meetingId: roomId, err: null };
};




// export async function createMeeting({
//   videoSessionId,
// }: {
//   videoSessionId: string;
// }): Promise<{ token: string; roomId: string; message: string }> {
//   if (!videoSessionId) {
//     return { token: '', roomId: '', message: 'Missing video session ID' };
//   }

//   try {
//     const roomId = await createVideoSdkRoom({ token: authToken });
//     if (!roomId) {
//       return { token: '', roomId: '', message: 'Failed to create meeting' };
//     }
//     return { token: authToken, roomId, message: '' };
//   } catch (error) {
//     return {
//       token: '',
//       roomId: '',
//       message: error instanceof Error ? error.message : 'Failed to create meeting',
//     };
//   }
// }

// export async function joinMeeting({
//   videoSessionId,
// }: {
//   videoSessionId: string;
// }): Promise<{ token: string; roomId: string; message: string }> {
//   if (!videoSessionId) {
//     return { token: '', roomId: '', message: 'Missing video session ID' };
//   }

//   if (!VIDEO_SDK_ROOM_ID.test(videoSessionId)) {
//     return {
//       token: '',
//       roomId: '',
//       message: 'هذا الاجتماع لم يتم إنشاؤه بعد من قبل المدرس.',
//     };
//   }

//   return { token: authToken, roomId: videoSessionId, message: '' };
// }

// export async function leaveMeetingAction(_videoSessionId: string) {
//   return { success: true as const };
// }

// export async function endMeetingAction(_videoSessionId: string) {
//   return { success: true as const };
// }
