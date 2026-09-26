import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Settings,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

export default function StudentWebcam({
  interviewActive = false,
  candidateName = "Candidate",
  targetRole = "Software Engineer"
}) {
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSecureOrigin, setIsSecureOrigin] = useState(true);
  const [audioLevel, setAudioLevel] = useState(8);

  // Available media devices
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Check browser security context (mediaDevices is restricted to localhost / HTTPS)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isHttps = window.location.protocol === 'https:';
      const secure = window.isSecureContext || isLocalhost || isHttps;
      setIsSecureOrigin(secure);
    }
  }, []);

  // Enumerate hardware devices
  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vDevs = devices.filter(d => d.kind === 'videoinput');
      const aDevs = devices.filter(d => d.kind === 'audioinput');

      setVideoDevices(vDevs);
      setAudioDevices(aDevs);

      // Auto-select current or first
      if (vDevs.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(vDevs[0].deviceId);
      }
      if (aDevs.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(aDevs[0].deviceId);
      }
    } catch (err) {
      console.warn("Could not enumerate media devices:", err);
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  // Clean up media tracks and Web Audio API
  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  }, []);

  // Request camera and microphone from the browser host device
  const startMediaStream = useCallback(async (videoDevId = selectedVideoDevice, audioDevId = selectedAudioDevice) => {
    stopMediaStream();
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage({
        type: 'UNSUPPORTED',
        text: "Your browser does not support webcam/microphone capture via navigator.mediaDevices."
      });
      setCameraActive(false);
      return;
    }

    const constraints = {
      video: videoDevId ? { deviceId: { exact: videoDevId }, width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: audioDevId ? { deviceId: { exact: audioDevId } } : true
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Autoplay policy delayed video playback:", playErr);
        }
      }

      setHasPermission(true);
      setCameraActive(true);
      setMicActive(true);
      setErrorMessage(null);

      // Re-enumerate devices now that labels are accessible post-permission
      refreshDevices();

      // Setup audio level visualizer
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const updateVolume = () => {
            if (!analyserRef.current) return;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.max(8, Math.round((avg / 255) * 100))));
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (audioErr) {
        console.warn("Audio meter setup skipped:", audioErr);
      }

    } catch (err) {
      console.warn("Webcam access error:", err.name, err.message);
      setCameraActive(false);
      setHasPermission(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage({
          type: 'PERMISSION_DENIED',
          text: "Camera or microphone permission was blocked. Please click the camera/lock icon in your browser address bar to allow access, then click 'Retry Permission'."
        });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage({
          type: 'NOT_FOUND',
          text: "No camera or microphone hardware was detected on this device. Please plug in a webcam or headset."
        });
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage({
          type: 'IN_USE',
          text: "Your camera or microphone is currently in use by another application (e.g. Zoom, Google Meet, Microsoft Teams). Please close other apps and retry."
        });
      } else {
        setErrorMessage({
          type: 'GENERIC',
          text: `Camera error: ${err.message || 'Unable to access media devices'}`
        });
      }
    }
  }, [selectedVideoDevice, selectedAudioDevice, refreshDevices, stopMediaStream]);

  // Initial startup
  useEffect(() => {
    startMediaStream();

    const handleDeviceChange = () => {
      refreshDevices();
    };

    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    }

    return () => {
      stopMediaStream();
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
    };
  }, []);

  // Switch video device
  const handleSelectVideoDevice = (deviceId) => {
    setSelectedVideoDevice(deviceId);
    startMediaStream(deviceId, selectedAudioDevice);
  };

  // Switch audio device
  const handleSelectAudioDevice = (deviceId) => {
    setSelectedAudioDevice(deviceId);
    startMediaStream(selectedVideoDevice, deviceId);
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
        return;
      }
    }
    // If no stream active, attempt to re-request
    startMediaStream();
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
        if (!audioTrack.enabled) {
          setAudioLevel(0);
        }
      }
    } else {
      setMicActive(!micActive);
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Non-localhost HTTP warning if applicable */}
      {!isSecureOrigin && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Browser Security Notice: </span>
            <span>
              Browsers disable webcam access on non-localhost HTTP (e.g. LAN IP). If testing on your laptop, please open{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">http://localhost:5173</code>
            </span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`inline-flex rounded-full h-2 w-2 ${interviewActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          </span>
          <span className="font-semibold text-slate-800">Candidate Video Feed</span>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {cameraActive ? 'LIVE WEBCAM' : 'STANDBY'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] hidden sm:flex">
            <span className="font-medium text-slate-700">{candidateName}</span>
            <span>•</span>
            <span className="truncate max-w-[130px]">{targetRole}</span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded-md transition ${showSettings ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            title="Webcam & Audio Device Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Device Settings Drawer */}
      {showSettings && (
        <div className="p-3 bg-blue-50/50 border-b border-blue-100 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-blue-600" />
              Input Devices (Local Machine)
            </span>
            <button
              onClick={() => refreshDevices()}
              className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Rescan Devices
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Camera Select */}
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">Camera Device</label>
              <select
                value={selectedVideoDevice}
                onChange={(e) => handleSelectVideoDevice(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-600 shadow-xs"
              >
                {videoDevices.length === 0 ? (
                  <option value="">Default Web Camera</option>
                ) : (
                  videoDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Mic Select */}
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">Microphone Device</label>
              <select
                value={selectedAudioDevice}
                onChange={(e) => handleSelectAudioDevice(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-600 shadow-xs"
              >
                {audioDevices.length === 0 ? (
                  <option value="">Default Microphone</option>
                ) : (
                  audioDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Microphone ${i + 1}`}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Video Viewport (Meet / Teams High-Quality Layout) */}
      <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Real Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
          }`}
        />

        {/* Fallback Camera Off / Permission UI */}
        {!cameraActive && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-10 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl font-bold text-slate-200 shadow-inner">
              {candidateName.charAt(0) || "C"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{candidateName}</p>
              <p className="text-xs text-slate-400 mt-0.5">Camera feed is currently paused</p>
            </div>

            {errorMessage ? (
              <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl text-left space-y-2 text-xs text-red-200 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 font-semibold text-red-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Media Access Note</span>
                </div>
                <p className="text-[11px] leading-relaxed text-red-200/90">{errorMessage.text}</p>
                <button
                  onClick={() => startMediaStream()}
                  className="mt-1 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Permission
                </button>
              </div>
            ) : (
              <button
                onClick={() => startMediaStream()}
                className="flex items-center gap-1.5 py-1.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" /> Turn On Camera
              </button>
            )}
          </div>
        )}

        {/* Candidate Bottom Floating Name & Mic Meter */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2.5 border border-white/10 shadow-lg">
          <span className="truncate max-w-[150px]">{candidateName} (You)</span>
          {micActive ? (
            <div className="flex items-center gap-0.5 h-3.5">
              {[25, 60, 40, 85, 55].map((factor, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(3, (audioLevel * factor) / 100)}px`,
                    opacity: audioLevel > 12 ? 1 : 0.4
                  }}
                />
              ))}
            </div>
          ) : (
            <span className="flex items-center gap-1 text-red-400 text-[10px] font-semibold bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/40">
              <MicOff className="w-2.5 h-2.5" /> MUTED
            </span>
          )}
        </div>

        {/* Quick Stream Controls Overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
          <button
            onClick={toggleMic}
            className={`p-2 rounded-lg text-white transition cursor-pointer ${
              micActive ? 'hover:bg-white/20' : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
            title={micActive ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={toggleCamera}
            className={`p-2 rounded-lg text-white transition cursor-pointer ${
              cameraActive ? 'hover:bg-white/20' : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
            title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
