const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

export const interviewApi = {
  // Start an interview session
  async startInterview(candidateData) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to start interview`);
      }
      return await res.json();
    } catch (err) {
      console.warn('Backend start failed, falling back to simulated connection or direct:', err);
      throw err;
    }
  },

  // Submit candidate answer and receive Qwen evaluation + next question
  async sendMessage(payload) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `HTTP ${res.status}: Failed to process message`);
      }
      return await res.json();
    } catch (err) {
      console.error('Error in interviewApi.sendMessage:', err);
      throw err;
    }
  },

  // Get aggregated evaluation for current session
  async evaluateSession(sessionId, evaluations) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, evaluations })
      });
      return await res.json();
    } catch (err) {
      console.error('Error evaluating session:', err);
      throw err;
    }
  },

  // End interview and generate final comprehensive report
  async endInterview(sessionId) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      return await res.json();
    } catch (err) {
      console.error('Error ending interview:', err);
      throw err;
    }
  },

  // Health check
  async checkHealth() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`, { timeout: 3000 });
      return await res.json();
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  },

  // LiveAvatar API methods
  async getLiveAvatarStatus() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/liveavatar/status`);
      return await res.json();
    } catch (err) {
      return { configured: false, error: err.message };
    }
  },

  async createLiveAvatarSession(avatarId) {
    const res = await fetch(`${BACKEND_URL}/api/liveavatar/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}: Failed to create LiveAvatar session`);
    }
    return await res.json();
  },

  async stopLiveAvatarSession(sessionId) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/liveavatar/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getPublicAvatars() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/liveavatar/avatars`);
      return await res.json();
    } catch (err) {
      return { success: false, avatars: [] };
    }
  },

  // Coding Practice API
  async getCodingProblems() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/coding/problems`);
      return await res.json();
    } catch (err) {
      return { success: false, problems: [] };
    }
  },

  async getCodingProblem(id) {
    const res = await fetch(`${BACKEND_URL}/api/coding/problem/${id}`);
    return await res.json();
  },

  async runCode(problemIdOrPayload, language, code, customInput) {
    const body = typeof problemIdOrPayload === 'object'
      ? problemIdOrPayload
      : { problemId: problemIdOrPayload, language, code, customInput };

    const res = await fetch(`${BACKEND_URL}/api/coding/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.result) {
      return {
        success: data.success,
        ...data.result
      };
    }
    return data;
  },

  async submitCode(problemIdOrPayload, language, code) {
    const body = typeof problemIdOrPayload === 'object'
      ? problemIdOrPayload
      : { problemId: problemIdOrPayload, language, code };

    const res = await fetch(`${BACKEND_URL}/api/coding/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.result) {
      return {
        success: data.success,
        ...data.result,
        xpAwarded: data.gamification?.xpGained || 0,
        newTotalXp: data.gamification?.currentXp,
        newLevel: data.gamification?.currentLevel,
        levelTitle: data.gamification?.levelTitle
      };
    }
    return data;
  },

  // Gamification, Profile, Leaderboard & Progress API
  async getProfile() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/profile`);
      return await res.json();
    } catch (err) {
      return { success: false, profile: null };
    }
  },

  async updateProfile(fields) {
    const res = await fetch(`${BACKEND_URL}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    return await res.json();
  },

  async getLeaderboard() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/leaderboard`);
      return await res.json();
    } catch (err) {
      return { success: false, leaderboard: [] };
    }
  },

  async getAchievements() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/achievements`);
      return await res.json();
    } catch (err) {
      return { success: false, achievements: [] };
    }
  },

  async getProgress() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/progress`);
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async awardXp(activityType, customAmount) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/xp/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityType, customAmount })
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  }
};

