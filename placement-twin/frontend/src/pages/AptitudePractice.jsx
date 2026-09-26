import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Timer } from 'lucide-react';

export default function AptitudePractice() {
  const [activeSection, setActiveSection] = useState('quantitative');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [seconds, setSeconds] = useState(60);

  const sections = [
    { id: 'quantitative', label: 'Quantitative Aptitude' },
    { id: 'logical', label: 'Logical Reasoning' },
    { id: 'verbal', label: 'Verbal Ability' }
  ];

  const questions = {
    quantitative: [
      {
        q: "A train running at 54 km/hr takes 20 seconds to pass a platform. Next, it takes 12 seconds to pass a man standing on the platform. What is the length of the platform?",
        options: ["120 meters", "150 meters", "180 meters", "200 meters"],
        correct: 0,
        solution: "Speed = 54 × (5/18) = 15 m/s. Train length = 15 × 12 = 180 m. Total platform distance = 15 × 20 = 300 m. Platform length = 300 - 180 = 120 meters."
      },
      {
        q: "If 12 men or 18 women can reap a field in 14 days, in how many days can 8 men and 16 women reap the same field?",
        options: ["8 days", "9 days", "10 days", "12 days"],
        correct: 1,
        solution: "12 Men = 18 Women => 1 Man = 1.5 Women. 8 Men + 16 Women = (8 × 1.5) + 16 = 28 Women. Using M1*D1 = M2*D2: 18 × 14 = 28 × D2 => D2 = (18 × 14) / 28 = 9 days."
      }
    ],
    logical: [
      {
        q: "Pointing to a photograph, a woman says: 'He is the son of the only daughter-in-law of my husband's father.' How is the man in the photograph related to the woman?",
        options: ["Brother", "Son", "Husband", "Nephew"],
        correct: 1,
        solution: "Husband's father = Father-in-law. The only daughter-in-law is the woman herself. The boy is her son."
      }
    ],
    verbal: [
      {
        q: "Choose the word which is most nearly the OPPOSITE in meaning to 'EPHEMERAL':",
        options: ["Transient", "Perpetual", "Fleeting", "Elusive"],
        correct: 1,
        solution: "'Ephemeral' means lasting for a short time. 'Perpetual' means permanent or never ending, which is the direct antonym."
      }
    ]
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIdx]);

  const list = questions[activeSection] || [];
  const q = list[currentIdx];

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelectedAnswer(idx);
    setRevealed(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setRevealed(false);
    setSeconds(60);
    if (currentIdx < list.length - 1) setCurrentIdx(currentIdx + 1);
    else setCurrentIdx(0);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Campus Aptitude Practice</h1>
          <p className="text-xs text-slate-500 mt-1">
            Master the quantitative and logical screening tests used in campus drives.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
          <Timer className="w-4 h-4 text-blue-600" />
          <span className="font-mono text-blue-700 font-bold">{seconds}s</span>
          <span className="text-slate-500">remaining</span>
        </div>
      </div>

      <div className="flex gap-2">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSection(s.id);
              setCurrentIdx(0);
              setSelectedAnswer(null);
              setRevealed(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeSection === s.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {q && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Question {currentIdx + 1} of {list.length}</span>
            <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Standard Question</span>
          </div>

          <h3 className="text-base font-semibold text-slate-900 leading-relaxed">{q.q}</h3>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              const isRight = i === q.correct;
              let style = "bg-white border-slate-200 text-slate-800 hover:bg-slate-50";
              if (revealed) {
                if (isRight) style = "bg-emerald-50 border-emerald-300 text-emerald-800";
                else if (isSelected) style = "bg-red-50 border-red-300 text-red-800";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={revealed}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm flex items-center justify-between transition cursor-pointer ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-semibold text-xs text-slate-600">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {revealed && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {revealed && isSelected && !isRight && <XCircle className="w-4 h-4 text-red-600" />}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
              <span className="text-blue-800 font-semibold">Step-by-Step Solution:</span>
              <p className="text-slate-700 leading-relaxed font-sans">{q.solution}</p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
