import axios from 'axios';

const LIVEAVATAR_API_BASE = 'https://api.liveavatar.com';
const DEFAULT_AVATAR_ID = process.env.DEFAULT_AVATAR_ID || '513fd1b7-7ef9-466d-9af2-344e51eeb833';

/**
 * Service to interact with the official LiveAvatar API
 * Handles server-side authenticated token generation and session management.
 * NEVER exposes the LIVEAVATAR_API_KEY to clients.
 */
export const liveavatarService = {
  /**
   * Request a new session token for the client-side LiveAvatar SDK
   */
  async createSessionToken({ avatarId, isSandbox = false } = {}) {
    const apiKey = process.env.LIVEAVATAR_API_KEY;
    if (!apiKey) {
      throw new Error('LIVEAVATAR_API_KEY is not configured in backend environment variables.');
    }

    const targetAvatarId = avatarId || DEFAULT_AVATAR_ID;

    try {
      const response = await axios.post(
        `${LIVEAVATAR_API_BASE}/v1/sessions/token`,
        {
          mode: 'FULL',
          avatar_id: targetAvatarId,
          is_sandbox: Boolean(isSandbox),
          avatar_persona: {
            language: 'en'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey
          },
          timeout: 15000
        }
      );

      const result = response.data;
      if (!result || !result.data || !result.data.session_token) {
        throw new Error(result?.message || 'Invalid response from LiveAvatar token endpoint');
      }

      // Return only the public session identifiers needed by the frontend SDK
      return {
        sessionId: result.data.session_id,
        sessionToken: result.data.session_token,
        avatarId: targetAvatarId
      };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('[LiveAvatar Service] Token creation error:', errorMsg);
      throw new Error(`Failed to create LiveAvatar session: ${errorMsg}`);
    }
  },

  /**
   * Stop an active LiveAvatar session
   */
  async stopSession(sessionId) {
    const apiKey = process.env.LIVEAVATAR_API_KEY;
    if (!apiKey || !sessionId) return { success: false };

    try {
      await axios.post(
        `${LIVEAVATAR_API_BASE}/v1/sessions/stop`,
        {
          session_id: sessionId,
          reason: 'USER_CLOSED'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey
          },
          timeout: 10000
        }
      );
      return { success: true };
    } catch (error) {
      console.warn('[LiveAvatar Service] Stop session warning:', error.response?.data?.message || error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Fetch active public avatars for selection
   */
  async getPublicAvatars() {
    const apiKey = process.env.LIVEAVATAR_API_KEY;
    if (!apiKey) return [];

    try {
      const response = await axios.get(`${LIVEAVATAR_API_BASE}/v1/avatars/public?page=1&page_size=15`, {
        headers: { 'X-API-KEY': apiKey },
        timeout: 10000
      });
      const results = response.data?.data?.results || [];
      return results.map(a => ({
        id: a.id,
        name: a.name,
        previewUrl: a.preview_url,
        status: a.status
      }));
    } catch (error) {
      console.warn('[LiveAvatar Service] Failed to fetch public avatars:', error.message);
      return [];
    }
  }
};
