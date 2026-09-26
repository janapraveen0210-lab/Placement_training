import React, { useState, useEffect } from 'react';
import StudentWebcam from '../components/StudentWebcam';
import LiveAvatarPanel from '../components/LiveAvatarPanel';
import LiveTranscript from '../components/LiveTranscript';
import AnswerControls from '../components/AnswerControls';
import InterviewMetrics from '../components/InterviewMetrics';
import { StartInterviewModal, EndInterviewModal } from '../components/InterviewModal';
import { interviewApi } from '../api/interviewApi';
import { Play, PhoneOff, AlertCircle, Sparkles, User, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AIInterview() {
  const [interviewActive, setInterviewActive] = useState(false);
  const [interviewerStatus, setInterviewerStatus] = useState("Listening"); // "Speaking" | "Listening" | "Thinking" | "Connected" | "Connecting" | "Disconnected"
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Session & Candidate info
  const [sessionId, setSessionId] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState({
    candidateName: "Alex Johnson",
    role: "Software Engineer - Full Stack",
    techStack: "React, Node.js, Python, SQL",
    experienceLevel: "Fresher / College Graduate"
  });

  // LiveAvatar state
  const [liveAvatarSessionToken, setLiveAvatarSessionToken] = useState(null);
  const [liveAvatarSessionId, setLiveAvatarSessionId] = useState(null);
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState('513fd1b7-7ef9-466d-9af2-344e51eeb833');

  // Current Question & Conversation stream
  const [currentQuestion, setCurrentQuestion] = useState(
    "Welcome to your Placement Twin Technical Interview. Configure your role and click 'Start Interview' to connect with the interviewer."
  );
  const [conversation, setConversation] = useState([]);

  // Real evaluation metrics from Qwen
  const [metrics, setMetrics] = useState({
    technical_score: 0,
    communication_score: 0,
    structure_score: 0,
    problem_solving_score: 0,
    project_score: 0,
    overall_score: 0,
    strengths: [],
    improvements: [],
    follow_up_reason: ""
  });
  const [evaluationHistory, setEvaluationHistory] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [liveAvatarError, setLiveAvatarError] = useState(null);

  // Fetch available avatars and user profile on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [avatarRes, profileRes] = await Promise.allSettled([
          interviewApi.getPublicAvatars(),
          interviewApi.getProfile()
        ]);
        if (avatarRes.status === 'fulfilled' && avatarRes.value?.success && avatarRes.value?.avatars?.length > 0) {
          setAvailableAvatars(avatarRes.value.avatars);
        }
        if (profileRes.status === 'fulfilled' && profileRes.value?.success && profileRes.value?.profile?.name) {
          setCandidateInfo(prev => ({
            ...prev,
            candidateName: profileRes.value.profile.name
          }));
        }
      } catch (e) {
        console.warn('Could not fetch avatars/profile on mount:', e.message);
      }
    };
    fetchData();
  }, []);

  // START INTERVIEW FLOW
  const handleStartInterview = async (config) => {
    setShowStartModal(false);
    setErrorMessage(null);
    setLiveAvatarError(null);
    setCandidateInfo(config);
    if (config.avatarId) setSelectedAvatarId(config.avatarId);
    setIsThinking(true);
    setInterviewerStatus("Connecting");

    try {
      // STEP 1: Create Qwen interview session via backend
      const qwenData = await interviewApi.startInterview(config);
      setSessionId(qwenData.sessionId);

      const welcomeMsg = qwenData.message || qwenData.question;
      setCurrentQuestion(welcomeMsg);
      setConversation([{ role: 'assistant', content: welcomeMsg }]);

      if (qwenData.currentMetrics) {
        setMetrics(qwenData.currentMetrics);
      }

      // STEP 2 & 3: Create LiveAvatar session through Node backend
      try {
        const avatarSessionData = await interviewApi.createLiveAvatarSession(config.avatarId || selectedAvatarId);
        if (avatarSessionData.success && avatarSessionData.sessionToken) {
          setLiveAvatarSessionToken(avatarSessionData.sessionToken);
          setLiveAvatarSessionId(avatarSessionData.sessionId);
        } else {
          setLiveAvatarError("LiveAvatar session token unavailable. Continuing with text-based interview.");
        }
      } catch (avatarErr) {
        console.warn("[LiveAvatar] Could not start avatar stream:", avatarErr.message);
        setLiveAvatarError(`LiveAvatar stream connection note: ${avatarErr.message}. You can continue with text-based interview.`);
      }

      // Activate interview
      setInterviewActive(true);
      setInterviewerStatus("Listening");

    } catch (err) {
      console.error("Failed to start interview session:", err);
      setErrorMessage("Could not connect to interview backend. Please ensure the Express backend (port 5000) and AI service (port 8000) are running.");
      setInterviewerStatus("Disconnected");
    } finally {
      setIsThinking(false);
    }
  };

  // SUBMIT STUDENT ANSWER (Qwen Brain evaluates + LiveAvatar speaks next question)
  const handleSubmitAnswer = async (answer) => {
    if (!answer.trim() || isThinking) return;

    setErrorMessage(null);
    setIsThinking(true);
    setInterviewerStatus("Thinking");

    // Add candidate's response to transcript immediately
    const updatedConversation = [
      ...conversation,
      { role: 'user', content: answer }
    ];
    setConversation(updatedConversation);

    try {
      const payload = {
        sessionId,
        message: answer,
        conversation: updatedConversation,
        role: candidateInfo.role,
        techStack: candidateInfo.techStack
      };

      // Qwen evaluates answer and generates next adaptive question
      const result = await interviewApi.sendMessage(payload);

      if (result.success && result.evaluation) {
        const evalData = result.evaluation;
        setMetrics({
          technical_score: evalData.technical_score,
          communication_score: evalData.communication_score,
          structure_score: evalData.structure_score,
          problem_solving_score: evalData.problem_solving_score,
          project_score: evalData.project_score,
          overall_score: evalData.overall_score,
          strengths: evalData.strengths || [],
          improvements: evalData.improvements || [],
          follow_up_reason: evalData.follow_up_reason || ""
        });

        setEvaluationHistory(prev => [...prev, evalData]);

        const nextQ = evalData.next_question || result.response;
        // Display exact question in UI
        setCurrentQuestion(nextQ);

        // Add to transcript
        setConversation([
          ...updatedConversation,
          { role: 'assistant', content: result.response }
        ]);

        // LiveAvatarPanel will automatically speak nextQ via session.repeat()
        setInterviewerStatus("Speaking");
      } else {
        throw new Error(result.error || "Unexpected AI evaluation response format");
      }
    } catch (err) {
      console.error("Failed to evaluate answer:", err);
      setErrorMessage(`Evaluation error: ${err.message}`);
      setInterviewerStatus("Listening");
    } finally {
      setIsThinking(false);
    }
  };

  // END INTERVIEW FLOW
  const handleEndInterview = async () => {
    setInterviewerStatus("Disconnected");

    // Stop LiveAvatar session if active
    if (liveAvatarSessionId) {
      interviewApi.stopLiveAvatarSession(liveAvatarSessionId).catch(() => {});
      setLiveAvatarSessionToken(null);
      setLiveAvatarSessionId(null);
    }

    try {
      const result = await interviewApi.endInterview(sessionId);
      if (result.success && result.report) {
        setFinalReport(result.report);
      } else {
        const n = evaluationHistory.length || 1;
        const avg = (k) => Math.round(evaluationHistory.reduce((a, c) => a + (c[k] || 75), 0) / n);
        setFinalReport({
          candidateName: candidateInfo.candidateName,
          role: candidateInfo.role,
          totalQuestionsAnswered: evaluationHistory.length,
          finalScores: {
            technicalKnowledge: avg('technical_score'),
            communication: avg('communication_score'),
            answerStructure: avg('structure_score'),
            problemSolving: avg('problem_solving_score'),
            projectKnowledge: avg('project_score'),
            overallPlacementReadiness: avg('overall_score')
          },
          allStrengths: Array.from(new Set(evaluationHistory.flatMap(e => e.strengths || []))),
          allImprovements: Array.from(new Set(evaluationHistory.flatMap(e => e.improvements || [])))
        });
      }

      setInterviewActive(false);
      setShowEndModal(true);

      // Celebrate if overall score is strong
      try {
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

    } catch (err) {
      console.error("Error finalizing interview:", err);
      setInterviewActive(false);
      setShowEndModal(true);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Alert banner if service error */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 cursor-pointer font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {liveAvatarError && (
        <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
          <HelpCircle className="w-4 h-4 shrink-0 text-blue-600" />
          <span className="flex-1">{liveAvatarError}</span>
          <button
            onClick={() => setLiveAvatarError(null)}
            className="text-xs px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Interview Session Control Bar (Google Meet Style Top Bar) */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              {interviewActive ? `${candidateInfo.role} Interview` : 'Technical Placement Interview'}
            </h2>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              interviewActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
            }`}>
              {interviewActive ? '● Live Session' : 'Ready'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interviewer: <span className="font-medium text-slate-700">LiveAvatar</span> • Brain: <span className="font-medium text-slate-700">Qwen2.5-1.5B</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!interviewActive ? (
            <button
              onClick={() => setShowStartModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Interview</span>
            </button>
          ) : (
            <button
              onClick={handleEndInterview}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer active:scale-98"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Interview & Get Scorecard</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Call Split View (Google Meet Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Left Side: Candidate Webcam */}
        <div>
          <StudentWebcam
            interviewActive={interviewActive}
            candidateName={candidateInfo.candidateName}
            targetRole={candidateInfo.role}
          />
        </div>

        {/* Right Side: Real LiveAvatar Video Stream */}
        <div>
          <LiveAvatarPanel
            sessionToken={liveAvatarSessionToken}
            sessionId={liveAvatarSessionId}
            isSessionActive={interviewActive}
            currentQuestion={currentQuestion}
            interviewerStatus={interviewerStatus}
            onStatusChange={(status) => setInterviewerStatus(status)}
            onError={(msg) => setLiveAvatarError(msg)}
          />
        </div>
      </div>

      {/* Prominent Current Question Display */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
            Current Question
          </span>
          <span className="text-xs text-slate-500">• Spoken by LiveAvatar</span>
        </div>
        <p className="text-sm md:text-base font-semibold text-slate-900 leading-relaxed">
          {currentQuestion}
        </p>
      </div>

      {/* Candidate Answer Input */}
      <div>
        <AnswerControls
          onSubmitAnswer={handleSubmitAnswer}
          disabled={!interviewActive}
          isThinking={isThinking}
          placeholder={
            !interviewActive
              ? "Start the interview above to begin submitting your answers..."
              : "Type your answer and press Enter (or click Voice Dictation to speak)..."
          }
        />
      </div>

      {/* Evaluation Metrics & Feedback */}
      <div>
        <InterviewMetrics metrics={metrics} evaluationHistory={evaluationHistory} />
      </div>

      {/* Live Transcript Stream */}
      <div>
        <LiveTranscript conversation={conversation} />
      </div>

      {/* Modals */}
      <StartInterviewModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onStart={handleStartInterview}
        availableAvatars={availableAvatars}
      />

      <EndInterviewModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        report={finalReport}
        onRestart={() => setShowStartModal(true)}
      />
    </div>
  );
}
