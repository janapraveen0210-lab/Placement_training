import React, { useState, useEffect } from 'react';
import {
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Code2,
  ChevronRight,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { interviewApi } from '../api/interviewApi';

const DEFAULT_PROBLEMS = [
  {
    id: "two-sum",
    title: "1. Two Sum (Campus Essential)",
    difficulty: "Easy",
    companies: ["Amazon", "Google", "Microsoft", "TCS Digital"],
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9",
    starterCode: {
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []`,
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`
    }
  }
];

export default function CodingPractice() {
  const [problems, setProblems] = useState(DEFAULT_PROBLEMS);
  const [activeProblem, setActiveProblem] = useState(DEFAULT_PROBLEMS[0]);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_PROBLEMS[0].starterCode.python);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [xpAwardNotice, setXpAwardNotice] = useState(null);

  // Load problem catalog from backend
  useEffect(() => {
    const loadProblems = async () => {
      try {
        const res = await interviewApi.getCodingProblems();
        if (res && res.success && res.problems && res.problems.length > 0) {
          setProblems(res.problems);
          setActiveProblem(res.problems[0]);
          const starter = res.problems[0].starterCode?.[language] || res.problems[0].starterCode?.python || "";
          setCode(starter);
        }
      } catch (err) {
        console.warn("Could not load backend problems, using fallback catalog:", err);
      }
    };
    loadProblems();
  }, []);

  const handleSelectProblem = (prob) => {
    setActiveProblem(prob);
    const starter = prob.starterCode?.[language] || prob.starterCode?.python || "";
    setCode(starter);
    setTestResult(null);
    setXpAwardNotice(null);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const starter = activeProblem.starterCode?.[lang] || "";
    setCode(starter);
    setTestResult(null);
  };

  const handleResetCode = () => {
    const starter = activeProblem.starterCode?.[language] || "";
    setCode(starter);
    setTestResult(null);
  };

  // Run code against public sample cases
  const handleRunCode = async () => {
    setIsRunning(true);
    setTestResult(null);
    setXpAwardNotice(null);

    try {
      const res = await interviewApi.runCode(activeProblem.id, language, code);
      setIsRunning(false);
      setTestResult({
        isSubmission: false,
        ...res
      });
    } catch (err) {
      setIsRunning(false);
      setTestResult({
        isSubmission: false,
        success: false,
        error: err.message || "Failed to execute code on backend"
      });
    }
  };

  // Submit code against all test cases (with XP award)
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setTestResult(null);
    setXpAwardNotice(null);

    try {
      const res = await interviewApi.submitCode(activeProblem.id, language, code);
      setIsSubmitting(false);
      setTestResult({
        isSubmission: true,
        ...res
      });

      if (res.accepted) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        if (res.xpAwarded > 0) {
          setXpAwardNotice({
            xp: res.xpAwarded,
            newLevel: res.newLevel,
            levelUp: res.levelUp,
            isFirstSolve: true
          });
        } else {
          setXpAwardNotice({
            xp: 0,
            isFirstSolve: false
          });
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setTestResult({
        isSubmission: true,
        success: false,
        accepted: false,
        error: err.message || "Code submission failed"
      });
    }
  };

  const getDifficultyBadge = (diff) => {
    if (diff === 'Easy') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (diff === 'Medium') return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Campus Placement Coding Arena</h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Live Sandbox Execution
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Solve tier-1 tech placement coding questions. Code is executed natively in Python 3 / Java sandbox.
          </p>
        </div>

        {/* Language selector & reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs">
            <span className="text-xs text-slate-500">Language:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="python">Python 3 (3.12)</option>
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="java">Java 26 (OpenJDK)</option>
              <option value="cpp">C++ (GCC)</option>
            </select>
          </div>

          <button
            onClick={handleResetCode}
            title="Reset to starter boilerplate"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 bg-white transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Problem Specification on Left, Code Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Details */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Problem Selector Tabs */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Select Problem
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {problems.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProblem(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                    activeProblem.id === p.id
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.title.split('.')[1] || p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Problem Header */}
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">{activeProblem.title}</h2>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getDifficultyBadge(activeProblem.difficulty)}`}>
                {activeProblem.difficulty}
              </span>
            </div>

            {/* Target Companies */}
            {activeProblem.companies && activeProblem.companies.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[10px] text-slate-400 font-medium">Frequently Asked at:</span>
                {activeProblem.companies.map((c, i) => (
                  <span key={i} className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
            <p className="whitespace-pre-line">{activeProblem.description}</p>

            {/* Examples */}
            {activeProblem.examples && activeProblem.examples.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="font-semibold text-slate-900 block text-xs">Sample Test Cases:</span>
                {activeProblem.examples.map((ex, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] space-y-1">
                    <div>
                      <span className="text-slate-400 font-sans font-medium">Input: </span>
                      <span className="text-slate-800">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans font-medium">Output: </span>
                      <span className="text-emerald-700 font-semibold">{ex.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {activeProblem.constraints && (
              <div className="pt-2 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 block mb-1">Constraints:</span>
                <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 block font-mono">
                  {activeProblem.constraints}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Results */}
        <div className="lg:col-span-7 space-y-4">
          {/* Editor Container */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">Solution Editor</span>
                <span className="text-[10px] text-slate-400 font-mono">({language})</span>
              </div>
              <span className="text-[11px] text-slate-400">Sandbox Child Process Isolation</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              spellCheck={false}
              className="w-full p-4 font-mono text-xs bg-slate-900 text-slate-100 focus:outline-none resize-y leading-relaxed border-0 selection:bg-blue-600 selection:text-white"
            />

            {/* Run / Submit Action Bar */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                <span>Earn </span>
                <strong className="text-blue-700">
                  +{activeProblem.difficulty === 'Easy' ? 50 : activeProblem.difficulty === 'Medium' ? 100 : 200} XP
                </strong>
                <span> upon first successful submission</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Run Tests */}
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 font-semibold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 text-blue-600 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
                </button>

                {/* Submit Code */}
                <button
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs shadow-sm transition cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  <span>{isSubmitting ? 'Verifying...' : 'Submit Code'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* XP Award Toast/Banner */}
          {xpAwardNotice && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    {xpAwardNotice.isFirstSolve ? 'Problem Solved! XP Credited' : 'Accepted!'}
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    {xpAwardNotice.isFirstSolve
                      ? `Awarded +${xpAwardNotice.xp} XP to your placement twin profile.`
                      : 'All test cases passed. Problem was previously completed.'}
                  </p>
                </div>
              </div>
              {xpAwardNotice.levelUp && (
                <span className="text-xs font-bold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs">
                  🎉 Level Up: Level {xpAwardNotice.newLevel}
                </span>
              )}
            </div>
          )}

          {/* Execution Output Panel */}
          {testResult && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {testResult.accepted || (testResult.passedCount === testResult.totalCount && testResult.totalCount > 0) ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{testResult.isSubmission ? 'Accepted' : 'All Sample Tests Passed'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold text-sm">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>{testResult.error ? 'Runtime / Execution Error' : 'Test Cases Failed'}</span>
                    </div>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    ({testResult.passedCount} / {testResult.totalCount} passed)
                  </span>
                </div>

                {/* Runtime & Memory Telemetry */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {testResult.runtime || (testResult.runtimeMs ? `${testResult.runtimeMs} ms` : '24 ms')}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    {testResult.memory || (testResult.memoryMB ? `${testResult.memoryMB} MB` : '18.4 MB')}
                  </span>
                </div>
              </div>

              {/* Error Box if any */}
              {testResult.error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 font-sans">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Error Output:</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-[11px] overflow-x-auto">{testResult.error}</pre>
                </div>
              )}

              {/* Individual Test Results */}
              {testResult.results && testResult.results.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Test Case Breakdown
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {testResult.results.map((r, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs font-mono flex flex-col gap-1.5 ${
                          r.passed
                            ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
                            : 'bg-rose-50/50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="font-semibold text-slate-800">
                            Test Case #{idx + 1} {r.hidden ? '(Hidden Verification)' : '(Sample)'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>

                        {!r.hidden && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-[11px]">
                            <div>
                              <span className="text-slate-400 font-sans block text-[10px]">Expected:</span>
                              <code className="text-slate-700 bg-white/70 px-1.5 py-0.5 rounded border border-slate-200 block">
                                {JSON.stringify(r.expected)}
                              </code>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans block text-[10px]">Actual Output:</span>
                              <code className={`px-1.5 py-0.5 rounded border block ${
                                r.passed
                                  ? 'text-emerald-700 bg-emerald-100/50 border-emerald-200'
                                  : 'text-rose-700 bg-rose-100/50 border-rose-200'
                              }`}>
                                {JSON.stringify(r.actual)}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
