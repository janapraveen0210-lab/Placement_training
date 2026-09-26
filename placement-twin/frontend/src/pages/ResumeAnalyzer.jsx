import React, { useState } from 'react';
import { FileText, Search, ArrowRight } from 'lucide-react';

export default function ResumeAnalyzer() {
  const sampleResume = `ALEX JOHNSON
Email: alex.johnson@college.edu | GitHub: github.com/alexj | LinkedIn: linkedin.com/in/alexj

EDUCATION
B.Tech in Computer Science & Engineering (2022 - 2026) | CGPA: 8.9 / 10

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, C++, SQL
Frameworks & Libraries: React, Node.js, Express, FastAPI, Tailwind CSS
Databases & Cloud: PostgreSQL, MongoDB, Redis, Docker, AWS (S3, EC2), Git

PROJECTS
1. Placement Twin - AI Interview Simulator
- Engineered a full-stack automated placement interview platform using React, Node.js, and local Qwen2.5-1.5B LLM.
- Implemented real-time WebRTC LiveAvatar video stream and Speech-to-Text interaction.
- Reduced inference latency by 40% utilizing GPU bfloat16 tensor caching.

2. Cloud Task Orchestrator
- Built a distributed microservices task queue with Node.js, Redis Streams, and PostgreSQL.
- Scaled system throughput to handle 5,000 requests/sec with 99.9% uptime.`;

  const [resumeText, setResumeText] = useState(sampleResume);
  const [analysis, setAnalysis] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const runAnalysis = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const text = resumeText.toLowerCase();

      const keywords = ["react", "node", "python", "docker", "sql", "aws", "redis", "fastapi", "git", "rest", "dsa", "c++"];
      const foundKeywords = keywords.filter(k => text.includes(k));

      const powerVerbs = ["engineered", "built", "implemented", "reduced", "scaled", "architected", "optimized", "developed"];
      const foundVerbs = powerVerbs.filter(v => text.includes(v));

      const hasMetrics = /\d+%\s*|\d+\s*(ms|requests|users)/i.test(resumeText);

      const atsScore = Math.min(95, Math.round((foundKeywords.length / keywords.length) * 50 + (foundVerbs.length / powerVerbs.length) * 35 + (hasMetrics ? 15 : 0)));

      setAnalysis({
        atsScore,
        foundKeywords,
        missingKeywords: keywords.filter(k => !text.includes(k)),
        foundVerbs,
        hasMetrics,
        suggestions: [
          "Ensure your contact hyperlinks (GitHub, LinkedIn) are active and easily visible.",
          "Include quantifiable metrics in every project bullet point (latency, user count, test coverage).",
          "Highlight core CS subjects like Operating Systems, DBMS, and Algorithms."
        ]
      });
    }, 600);
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Placement Resume ATS Analyzer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Audit your technical resume against campus hiring filters, keywords, and quantifiable achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor / Paste area */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Paste Resume Content</span>
            <button
              onClick={() => setResumeText(sampleResume)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition cursor-pointer"
            >
              Load Sample Resume
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-3 shadow-sm">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={16}
              className="w-full bg-slate-50 font-mono text-xs text-slate-900 p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white leading-relaxed"
            />
          </div>

          <button
            onClick={runAnalysis}
            disabled={isScanning || !resumeText.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{isScanning ? "Auditing Resume..." : "Run ATS Placement Scan"}</span>
          </button>
        </div>

        {/* Scan Results */}
        <div className="lg:col-span-6 space-y-4">
          {analysis ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-medium text-slate-500">ATS Score Rating</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold text-blue-700">{analysis.atsScore}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  analysis.atsScore >= 80
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  {analysis.atsScore >= 80 ? 'Shortlist Ready' : 'Review Recommended'}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <span className="text-xs font-semibold text-slate-800 block mb-2">Detected Technical Keywords</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.foundKeywords.map((k, i) => (
                    <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ {k}
                    </span>
                  ))}
                  {analysis.missingKeywords.map((k, i) => (
                    <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                      - {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verbs and Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium">Power Action Verbs</span>
                  <div className="text-slate-900 font-bold mt-1">{analysis.foundVerbs.length} verbs used</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium">Quantifiable Metrics</span>
                  <div className="text-emerald-700 font-bold mt-1">
                    {analysis.hasMetrics ? 'Present ✓' : 'Missing % / metrics'}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-xs font-semibold text-slate-800 block mb-2">Recommendations</span>
                <ul className="text-xs text-slate-600 space-y-2">
                  {analysis.suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center text-slate-400 space-y-3 min-h-[300px]">
              <FileText className="w-10 h-10 text-slate-300" />
              <p className="text-xs">Paste your resume and click 'Run ATS Placement Scan' to see your match rating.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
