import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, RefreshCw } from 'lucide-react';

export default function AnswerControls({
  onSubmitAnswer,
  disabled = false,
  isThinking = false,
  placeholder = "Type your answer here..."
}) {
  const [answerText, setAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSttSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerText(transcript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!sttSupported || !recognitionRef.current) {
      alert("Speech recognition is not available in this browser. Please type your answer.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn("Could not start STT:", err);
      }
    }
  };

  const handleSend = () => {
    if (!answerText.trim() || disabled || isThinking) return;
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    onSubmitAnswer(answerText.trim());
    setAnswerText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Candidate Answer Input</span>
        <div className="flex items-center gap-2">
          {isRecording && (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              Recording Speech...
            </span>
          )}
          <span className="text-[11px] text-slate-400 hidden sm:inline">Press Enter to send</span>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isThinking}
          placeholder={isThinking ? "Qwen AI is evaluating your response..." : placeholder}
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none transition"
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {sttSupported && (
              <button
                type="button"
                onClick={toggleRecording}
                disabled={disabled || isThinking}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  isRecording
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5 text-red-600" /> : <Mic className="w-3.5 h-3.5 text-slate-600" />}
                <span>{isRecording ? "Stop Dictation" : "Voice Dictation"}</span>
              </button>
            )}

            {answerText && (
              <button
                type="button"
                onClick={() => setAnswerText("")}
                className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!answerText.trim() || disabled || isThinking}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer ${
              answerText.trim() && !disabled && !isThinking
                ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {isThinking ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
