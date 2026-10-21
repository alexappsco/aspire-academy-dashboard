//This is the Auth token, you will use it to generate a meeting and connect to it
export const authToken: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI1ZWY4ODJiZi01ZjUyLTQwNjktOGNkMS1mYjAxNGFhOGJiZTUiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIiwiYWxsb3dfbW9kIl0sInZlcnNpb24iOiIyIiwicm9vbUlkIjoiamZ1Zi1ydHp3LXF3NTQiLCJyb2xlcyI6WyJydGMiXSwibmJmIjoxNzc1NjczMzg0LCJleHAiOjE3NzU2ODQxODQsImlhdCI6MTc3NTY3MzM4NH0.sRwmZ9P_xps24RI9hW4M8YHL7ArqZfUGl9h7Aq7oDl8"
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI1OTYyM2FjMy1hYzEzLTQ2OWItOTg0Ni1lOWE2MDNlZjNlZTciLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc3MzA2NTMwMSwiZXhwIjoxOTMwODUzMzAxfQ.c-JiXPgHEXQaE8BSx1Ioh_QbddykuZAQONg3FeZQSEY"
// 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI1ZWY4ODJiZi01ZjUyLTQwNjktOGNkMS1mYjAxNGFhOGJiZTUiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIiwiYWxsb3dfbW9kIl0sInZlcnNpb24iOiIyIiwicm9vbUlkIjoiMWduZi1hdTA0LXd0cGQiLCJyb2xlcyI6WyJydGMiXSwibmJmIjoxNzc1NjUwMDE2LCJleHAiOjE3NzU2NjA4MTYsImlhdCI6MTc3NTY1MDAxNn0.eLWAVPLmebUQt-V_vGuXYgjcYlfXc2hK3XvktSYFzmU';

// API call to create a meeting
export const createMeeting = async ({ token }: { token: string }) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: 'POST',
    headers: {
      authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Failed to create meeting (${res.status})`);
  }
  const { roomId }: { roomId: string } = await res.json();
  return roomId;
};
