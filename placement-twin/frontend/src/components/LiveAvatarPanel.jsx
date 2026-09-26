import React, { useEffect, useRef, useState } from 'react';
import { LiveAvatarSession, SessionEvent, SessionState } from '@heygen/liveavatar-web-sdk';
import { Video, AlertCircle, RefreshCw, Volume2, VolumeX, UserCheck } from 'lucide-react';

/**
 * LiveAvatarPanel
 * Real-time AI interviewer using the official LiveAvatar Web SDK.
 * Mounts the WebRTC video/audio stream and uses .repeat() to speak Qwen questions.
 */
export default function LiveAvatarPanel({
  sessionToken,
  sessionId,
  isSessionActive,
  currentQuestion,
  interviewerStatus = 'Listening',
  onStatusChange,
  onError,
  avatarName = 'Ann Therapist'
}) {
  const videoRef = useRef(null);
  const sessionRef = useRef(null);
  const lastSpokenQuestionRef = useRef('');

  const [connectionState, setConnectionState] = useState(SessionState.INACTIVE);
  const [streamReady, setStreamReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize and connect LiveAvatar session when sessionToken is provided
  useEffect(() => {
    let isCancelled = false;

    if (!sessionToken || !isSessionActive) {
      if (sessionRef.current) {
        cleanupSession();
      }
      return;
    }

    const initLiveAvatar = async () => {
      try {
        setErrorMessage(null);
        setConnectionState(SessionState.CONNECTING);
        if (onStatusChange) onStatusChange('Connecting');

        // Create official LiveAvatarSession instance
        const session = new LiveAvatarSession(sessionToken, {
          autoKeepAlive: true,
          voiceChat: {
            defaultMuted: true // Student answers via text or STT; keep avatar input quiet
          }
        });

        sessionRef.current = session;

        // Session state changes
        session.on(SessionEvent.SESSION_STATE_CHANGED, (state) => {
          if (isCancelled) return;
          console.log('[LiveAvatar SDK] State changed:', state);
          setConnectionState(state);
          if (state === SessionState.CONNECTED) {
            if (onStatusChange) onStatusChange('Connected');
          } else if (state === SessionState.DISCONNECTED) {
            setStreamReady(false);
            if (onStatusChange) onStatusChange('Disconnected');
          }
        });

        // Stream ready event: attach remote video & audio tracks to our video element
        session.on(SessionEvent.SESSION_STREAM_READY, () => {
          if (isCancelled) return;
          console.log('[LiveAvatar SDK] Remote media stream ready. Attaching to video element.');
          setStreamReady(true);
          if (videoRef.current) {
            try {
              session.attach(videoRef.current);
              videoRef.current.play().catch((playErr) => {
                console.warn('[LiveAvatar] Autoplay needs user interaction:', playErr);
              });
            } catch (attachErr) {
              console.error('[LiveAvatar] Attach track error:', attachErr);
            }
          }
        });

        // Disconnect event
        session.on(SessionEvent.SESSION_DISCONNECTED, (reason) => {
          if (isCancelled) return;
          console.warn('[LiveAvatar SDK] Disconnected:', reason);
          setStreamReady(false);
          setConnectionState(SessionState.DISCONNECTED);
          if (onStatusChange) onStatusChange('Disconnected');
        });

        // Start WebRTC connection
        console.log('[LiveAvatar SDK] Starting session...');
        await session.start();

        if (isCancelled) {
          session.stop().catch(() => {});
        }
      } catch (err) {
        if (isCancelled) return;
        const msg = err.message || 'Failed to start LiveAvatar session';
        console.error('[LiveAvatar] Connection error:', err);
        setErrorMessage(msg);
        setConnectionState(SessionState.DISCONNECTED);
        if (onError) onError(msg);
      }
    };

    initLiveAvatar();

    return () => {
      isCancelled = true;
      cleanupSession();
    };
  }, [sessionToken, isSessionActive]);

  // Clean up session
  const cleanupSession = async () => {
    if (sessionRef.current) {
      try {
        const s = sessionRef.current;
        sessionRef.current = null;
        await s.stop();
      } catch (e) {
        console.warn('[LiveAvatar] Error during session stop:', e.message);
      }
    }
    setStreamReady(false);
    setConnectionState(SessionState.INACTIVE);
  };

  // Speak incoming question from Qwen when question updates
  useEffect(() => {
    if (
      isSessionActive &&
      sessionRef.current &&
      connectionState === SessionState.CONNECTED &&
      currentQuestion &&
      currentQuestion !== lastSpokenQuestionRef.current
    ) {
      lastSpokenQuestionRef.current = currentQuestion;

      try {
        console.log('[LiveAvatar] Sending Qwen question to LiveAvatar speak:', currentQuestion.slice(0, 60));
        if (onStatusChange) onStatusChange('Speaking');
        sessionRef.current.repeat(currentQuestion);

        // Reset status back to Listening after reasonable duration
        const estimatedDurationMs = Math.min(18000, Math.max(4000, currentQuestion.split(' ').length * 360));
        setTimeout(() => {
          if (sessionRef.current && isSessionActive && onStatusChange) {
            onStatusChange('Listening');
          }
        }, estimatedDurationMs);
      } catch (err) {
        console.error('[LiveAvatar] Error sending question to repeat():', err);
      }
    }
  }, [currentQuestion, isSessionActive, connectionState]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const getStatusBadge = () => {
    if (errorMessage) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Connection Issue
        </span>
      );
    }

    if (connectionState === SessionState.CONNECTING) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
          Connecting Avatar...
        </span>
      );
    }

    if (connectionState === SessionState.CONNECTED) {
      const isSpeaking = interviewerStatus === 'Speaking';
      const isThinking = interviewerStatus === 'Thinking';
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          isSpeaking
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : isThinking
            ? 'bg-purple-50 text-purple-700 border-purple-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isSpeaking ? 'bg-blue-600 animate-pulse' : isThinking ? 'bg-purple-600' : 'bg-emerald-600'
          }`} />
          {isSpeaking ? 'Speaking' : isThinking ? 'Thinking...' : 'Connected • Listening'}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Standby
      </span>
    );
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-semibold text-xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-slate-800">AI Placement Interviewer</h3>
              <span className="text-[10px] font-medium bg-blue-100/60 text-blue-700 px-2 py-0.5 rounded">
                LiveAvatar
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Official Real-Time Video Stream</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {streamReady && (
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
              title={isMuted ? 'Unmute Avatar' : 'Mute Avatar'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-[4/3] bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Real LiveAvatar WebRTC Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            streamReady ? 'opacity-100' : 'opacity-0 absolute'
          }`}
        />

        {/* When stream is not ready or session is not active */}
        {!streamReady && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-10 max-w-sm">
            {connectionState === SessionState.CONNECTING ? (
              <>
                <RefreshCw className="w-10 h-10 text-blue-400 animate-spin" />
                <div>
                  <p className="text-sm font-semibold">Connecting to LiveAvatar...</p>
                  <p className="text-xs text-slate-400 mt-1">Establishing real-time WebRTC video and audio channels.</p>
                </div>
              </>
            ) : errorMessage ? (
              <>
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-300">LiveAvatar Connection Note</p>
                  <p className="text-xs text-slate-400 mt-1">{errorMessage}</p>
                  <p className="text-[11px] text-blue-300 mt-2">
                    Qwen adaptive interview and evaluation remain 100% functional.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">LiveAvatar Interview Stream</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Start Interview" below to connect with the real-time AI interviewer.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Bottom Bar: Avatar Name Label (Google Meet Style) */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Interviewer (LiveAvatar)</span>
        </div>
      </div>
    </div>
  );
}
