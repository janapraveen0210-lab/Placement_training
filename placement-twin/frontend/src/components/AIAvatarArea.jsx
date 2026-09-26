import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Cpu, Radio, Sparkles, BrainCircuit, Activity } from 'lucide-react';

/**
 * AIAvatarArea Component
 * 
 * ARCHITECTURE NOTICE:
 * This component is structured as a drop-in container ready for future LiveAvatar API integration.
 * - When LiveAvatar is enabled, the <LiveAvatarVideoPlayer /> will mount directly within the primary viewport slot.
 * - Until then, it renders a high-fidelity holographic AI Evaluator ("Dr. Nova - Twin Evaluator") with animated
 *   state transitions (Speaking / Listening / Thinking), holographic scanlines, and audio wave reactivity.
 */
export default function AIAvatarArea({
  interviewerStatus = "Listening", // "Speaking" | "Listening" | "Thinking"
  currentQuestion = "Welcome to Placement Twin. Start the interview whenever you are ready.",
  ttsEnabled = true,
  onToggleTTS,
  liveAvatarEnabled = false, // Feature flag hook for future LiveAvatar integration
  modelName = "Qwen2.5-1.5B-Instruct"
}) {
  const [pulseScale, setPulseScale] = useState(1);

  // Status visual configurations
  const statusConfig = {
    Speaking: {
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/40",
      indicator: "bg-cyan-400 shadow-cyan-400/50 shadow-sm",
      label: "Speaking",
      glowClass: "cyber-glow-cyan"
    },
    Listening: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/40",
      indicator: "bg-emerald-400 shadow-emerald-400/50 shadow-sm",
      label: "Listening to Answer",
      glowClass: ""
    },
    Thinking: {
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/40",
      indicator: "bg-purple-400 animate-pulse shadow-purple-400/50 shadow-sm",
      label: "Evaluating & Thinking...",
      glowClass: "cyber-glow-purple"
    }
  };

  const current = statusConfig[interviewerStatus] || statusConfig.Listening;

  return (
    <div className={`flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl relative transition-all duration-500 ${current.glowClass}`}>
      {/* Top Header */}
      <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">Dr. Nova AI</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.2 rounded-full font-mono">
                {modelName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Senior Placement Technical Evaluator</p>
          </div>
        </div>

        {/* Live Status Badge & TTS Control */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.border} ${current.color}`}>
            <span className={`w-2 h-2 rounded-full ${current.indicator}`} />
            <span>{current.label}</span>
          </div>

          <button
            onClick={onToggleTTS}
            title={ttsEnabled ? "Disable AI Voice (TTS)" : "Enable AI Voice (TTS)"}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              ttsEnabled
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Avatar Viewport */}
      <div className="relative aspect-[16/9] md:aspect-[21/11] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
        {/* Scanline & ambient grid */}
        <div className="scanline-effect" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {/* =========================================================================
            FUTURE LIVEAVATAR INTEGRATION SLOT:
            When LiveAvatar credentials and stream endpoint are supplied, this block
            will mount the WebRTC/HLS LiveAvatar interactive video player stream.
           ========================================================================= */}
        {liveAvatarEnabled ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            {/* LiveAvatar WebRTC video stream container */}
            <video id="liveavatar-stream" autoPlay playsInline className="w-full h-full object-cover" />
          </div>
        ) : (
          /* TEMPORARY PROFESSIONAL AI INTERVIEWER PLACEHOLDER */
          <div className="relative flex flex-col items-center justify-center z-10 space-y-6">
            {/* Outer Holographic Pulsing Rings */}
            <div className="relative flex items-center justify-center">
              {/* Dynamic Aura Rings based on state */}
              <div className={`absolute w-52 h-52 rounded-full transition-all duration-700 ${
                interviewerStatus === 'Speaking'
                  ? 'border-2 border-cyan-400/40 animate-ping opacity-30'
                  : interviewerStatus === 'Thinking'
                  ? 'border-2 border-purple-400/40 animate-pulse'
                  : 'border border-slate-700/50'
              }`} />

              <div className={`absolute w-44 h-44 rounded-full transition-all duration-500 ${
                interviewerStatus === 'Speaking'
                  ? 'bg-cyan-500/10 border border-cyan-400/30'
                  : interviewerStatus === 'Thinking'
                  ? 'bg-purple-500/10 border border-purple-400/30'
                  : 'bg-emerald-500/5 border border-emerald-500/20'
              }`} />

              {/* Central Futuristic Holographic Avatar Core */}
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-2 border-cyan-500/50 flex flex-col items-center justify-center shadow-xl shadow-cyan-500/20 relative group">
                {/* Internal radar & circuitry */}
                <div className="absolute inset-1 rounded-full border border-dashed border-cyan-500/20 animate-spin" style={{ animationDuration: '24s' }} />

                {interviewerStatus === 'Thinking' ? (
                  <BrainCircuit className="w-16 h-16 text-purple-400 animate-pulse" />
                ) : interviewerStatus === 'Speaking' ? (
                  <Activity className="w-16 h-16 text-cyan-300 animate-bounce" style={{ animationDuration: '1.5s' }} />
                ) : (
                  <div className="flex flex-col items-center">
                    <Radio className="w-12 h-12 text-emerald-400/90 mb-1" />
                    <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Listening</span>
                  </div>
                )}
              </div>
            </div>

            {/* Speaking Dynamic Audio Waveform */}
            {interviewerStatus === 'Speaking' && (
              <div className="flex items-center gap-1 h-8 px-4 py-1.5 rounded-full bg-slate-950/70 border border-cyan-500/30 shadow-md">
                {[12, 24, 32, 16, 28, 40, 22, 34, 18, 26, 38, 14, 20].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-gradient-to-t from-cyan-500 to-indigo-400 rounded-full wave-bar"
                    style={{
                      animationDelay: `${idx * 0.08}s`,
                      height: `${h}px`
                    }}
                  />
                ))}
              </div>
            )}

            {/* LiveAvatar Future Integration Badge Overlay */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-slate-700/60 backdrop-blur text-[10px] text-slate-400">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Modular LiveAvatar Interface Ready</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-mono">Qwen Evaluator v2.5</span>
            </div>
          </div>
        )}

        {/* Ambient Holographic Base Glow */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-cyan-950/30 to-transparent pointer-events-none" />
      </div>

      {/* Prominent Current Question Banner */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">Current Question</span>
          <span className="text-[10px] text-slate-500">• In-progress Prompt</span>
        </div>
        <p className="text-sm md:text-base font-medium text-slate-100 leading-relaxed">
          {currentQuestion}
        </p>
      </div>
    </div>
  );
}
