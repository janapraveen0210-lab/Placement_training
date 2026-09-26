import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, RotateCcw } from 'lucide-react';

export default function CommunicationLab() {
  const [activePrompt, setActivePrompt] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [metrics, setMetrics] = useState({
    wpm: 0,
    fillerCount: 0,
    confidence: 0,
    clarityScore: 0,
    fillersUsed: []
  });

  const prompts = [
    {
      title: "1. Professional Introduction",
      question: "Walk me through your resume, engineering background, and key project accomplishments.",
      idealPace: "130 - 150 WPM"
    },
    {
      title: "2. Technical Obstacle & Debugging",
      question: "Describe a difficult technical bug or system failure you encountered and how you triaged it.",
      idealPace: "120 - 140 WPM"
    },
    {
      title: "3. Team Collaboration",
      question: "Share an example where you handled technical disagreements or conflicting priorities on a project team.",
      idealPace: "125 - 145 WPM"
    }
  ];

  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
        analyzeSpeech(text);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const analyzeSpeech = (text) => {
    if (!text.trim()) return;
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const fillerWords = ["um", "uh", "like", "basically", "actually", "literally", "you know", "sort of", "kind of"];
    
    let foundFillers = [];
    words.forEach(w => {
      const cleanW = w.replace(/[^a-z]/g, '');
      if (fillerWords.includes(cleanW)) {
        foundFillers.push(cleanW);
      }
    });

    const elapsedMinutes = Math.max(0.1, (Date.now() - (startTimeRef.current || Date.now())) / 60000);
    const calculatedWpm = Math.round(words.length / elapsedMinutes);

    const fillerPenalty = Math.min(40, foundFillers.length * 8);
    const confidence = Math.max(50, Math.min(95, 90 - fillerPenalty));
    const clarity = calculatedWpm >= 110 && calculatedWpm <= 160 ? 92 : 72;

    setMetrics({
      wpm: calculatedWpm,
      fillerCount: foundFillers.length,
      fillersUsed: Array.from(new Set(foundFillers)),
      confidence,
      clarityScore: clarity
    });
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      startTimeRef.current = Date.now();
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Communication & Articulation Lab</h1>
        <p className="text-xs text-slate-500 mt-1">
          Measure speech pacing, detect filler words, and refine your behavioral answer delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prompts list */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Practice Prompts</h3>
          {prompts.map((p, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActivePrompt(idx);
                setTranscript("");
                setMetrics({ wpm: 0, fillerCount: 0, confidence: 0, clarityScore: 0, fillersUsed: [] });
              }}
              className={`p-4 rounded-xl border transition cursor-pointer ${
                activePrompt === idx
                  ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <h4 className="text-xs font-semibold text-slate-900">{p.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.question}</p>
              <span className="inline-block mt-2 text-[10px] font-medium text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                Target: {p.idealPace}
              </span>
            </div>
          ))}
        </div>

        {/* Live Lab View */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-semibold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Current Question
              </span>
              <h2 className="text-base font-semibold text-slate-900 mt-2">
                {prompts[activePrompt].question}
              </h2>
            </div>

            {/* Recording Controls */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? "Stop Speaking" : "Start Speaking Practice"}</span>
                </button>
                {isRecording && (
                  <span className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    Listening in Real-Time
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setTranscript("");
                  setMetrics({ wpm: 0, fillerCount: 0, confidence: 0, clarityScore: 0, fillersUsed: [] });
                }}
                className="text-xs text-slate-500 hover:text-slate-800 transition"
              >
                Reset
              </button>
            </div>

            {/* Transcript Area */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-h-[140px] text-xs text-slate-800 leading-relaxed font-sans">
              {transcript ? (
                transcript
              ) : (
                <span className="text-slate-400 italic">
                  Click 'Start Speaking Practice' and speak aloud. The speech analyzer will calculate your pace and detect filler words.
                </span>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium">Pace (WPM)</span>
                <div className="text-xl font-bold text-blue-700 mt-0.5">{metrics.wpm || "--"}</div>
                <span className="text-[10px] text-slate-400">Target: 130-150</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium">Filler Words</span>
                <div className={`text-xl font-bold mt-0.5 ${metrics.fillerCount > 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {metrics.fillerCount}
                </div>
                <span className="text-[10px] text-slate-400">{metrics.fillersUsed.join(', ') || 'None'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium">Fluency Rating</span>
                <div className="text-xl font-bold text-indigo-700 mt-0.5">{metrics.confidence ? `${metrics.confidence}%` : '--'}</div>
                <span className="text-[10px] text-slate-400">Cadence balance</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium">Clarity Score</span>
                <div className="text-xl font-bold text-emerald-700 mt-0.5">{metrics.clarityScore ? `${metrics.clarityScore}%` : '--'}</div>
                <span className="text-[10px] text-slate-400">Articulation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
