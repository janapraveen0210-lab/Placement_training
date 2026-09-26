import express from 'express';
import { liveavatarService } from '../services/liveavatarService.js';

const router = express.Router();

/**
 * GET /api/liveavatar/status
 * Check if LiveAvatar service is configured with an API key
 */
router.get('/status', (req, res) => {
  const isConfigured = Boolean(process.env.LIVEAVATAR_API_KEY && process.env.LIVEAVATAR_API_KEY.trim());
  res.json({
    configured: isConfigured,
    defaultAvatarId: process.env.DEFAULT_AVATAR_ID || '513fd1b7-7ef9-466d-9af2-344e51eeb833'
  });
});

/**
 * POST /api/liveavatar/session
 * Mint a new session token for the client-side LiveAvatar Web SDK
 */
router.post('/session', async (req, res) => {
  try {
    const { avatarId, isSandbox } = req.body;
    const sessionData = await liveavatarService.createSessionToken({ avatarId, isSandbox });
    res.json({
      success: true,
      ...sessionData
    });
  } catch (error) {
    console.error('[LiveAvatar Route] Session error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/liveavatar/stop
 * Stop an active LiveAvatar session
 */
router.post('/stop', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const result = await liveavatarService.stopSession(sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/liveavatar/avatars
 * List available public avatars
 */
router.get('/avatars', async (req, res) => {
  try {
    const avatars = await liveavatarService.getPublicAvatars();
    res.json({
      success: true,
      avatars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
