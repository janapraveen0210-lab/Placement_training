import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Award, HelpCircle } from 'lucide-react';

export default function SkillAssessment() {
  const [selectedCategory, setSelectedCategory] = useState('dsa');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [scores, setScores] = useState({ correct: 0, total: 0 });

  const categories = [
    { id: 'dsa', name: 'Data Structures & Algorithms' },
    { id: 'dbms', name: 'DBMS & SQL' },
    { id: 'os', name: 'Operating Systems & Concurrency' },
    { id: 'system_design', name: 'System Design Basics' },
  ];

  const questionsData = {
    dsa: [
      {
        q: "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answer: 2,
        explanation: "In an unbalanced or skewed BST, elements resemble a linked list, leading to O(n) search time."
      },
      {
        q: "Which data structure is optimal for implementing an LRU (Least Recently Used) cache with O(1) get and put operations?",
        options: ["Array and Stack", "Doubly Linked List and Hash Map", "Min-Heap and Binary Tree", "Queue and Circular Buffer"],
        answer: 1,
        explanation: "A Hash Map provides O(1) key lookup, and a Doubly Linked List enables O(1) node repositioning."
      },
      {
        q: "What is the amortized time complexity of inserting an element into a dynamic array (ArrayList) when it resizes?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        answer: 0,
        explanation: "Although array doubling takes O(n) occasionally, amortized over n insertions, each append takes O(1) on average."
      }
    ],
    dbms: [
      {
        q: "Which ACID property guarantees that all operations within a transaction are completed successfully, or none of them are?",
        options: ["Atomicity", "Consistency", "Isolation", "Durability"],
        answer: 0,
        explanation: "Atomicity enforces the 'all-or-nothing' rule for database transactions."
      },
      {
        q: "Which index structure is most widely used in relational databases like PostgreSQL and MySQL InnoDB for range queries?",
        options: ["Hash Index", "B+ Tree Index", "Bitmap Index", "R-Tree Index"],
        answer: 1,
        explanation: "B+ Trees maintain sorted order across leaf nodes, making range queries efficient with minimal disk I/O."
      }
    ],
    os: [
      {
        q: "Which condition is NOT one of Coffman's four conditions required for a deadlock to occur?",
        options: ["Mutual Exclusion", "Hold and Wait", "Preemption allowed", "Circular Wait"],
        answer: 2,
        explanation: "The condition is 'No Preemption'. If preemption is allowed, resources can be reclaimed to break deadlocks."
      }
    ],
    system_design: [
      {
        q: "In distributed systems, what does the CAP theorem state regarding network partitions?",
        options: [
          "A system can guarantee Consistency and Availability simultaneously during a network partition.",
          "During a network partition, you must trade off either Consistency or Availability.",
          "Partitions can always be prevented with redundant hardware.",
          "Consistency is always sacrificed in favor of latency."
        ],
        answer: 1,
        explanation: "When network partitions occur, distributed databases must choose between availability (returning data) or consistency (blocking stale reads)."
      }
    ]
  };

  const currentQuestions = questionsData[selectedCategory] || [];
  const currentQ = currentQuestions[currentIdx];

  const handleSelectOption = (index) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === currentQ.answer) {
      setScores(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setScores(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentIdx < currentQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Technical Skill Assessment</h1>
          <p className="text-xs text-slate-500 mt-1">
            Test your core CS fundamentals expected in technical screening rounds.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs shadow-xs">
          <Award className="w-4 h-4 text-blue-600" />
          <span className="text-slate-600">Score:</span>
          <span className="font-bold text-blue-700">
            {scores.correct} / {scores.total}
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCategory(c.id);
              setCurrentIdx(0);
              setSelectedOption(null);
              setShowExplanation(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Question Card */}
      {currentQ ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Question {currentIdx + 1} of {currentQuestions.length}</span>
            <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Multiple Choice</span>
          </div>

          <h3 className="text-base font-semibold text-slate-900 leading-relaxed">
            {currentQ.q}
          </h3>

          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.answer;

              let btnStyle = "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50";
              if (showExplanation) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-800";
                } else if (isSelected) {
                  btnStyle = "bg-red-50 border-red-300 text-red-800";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={showExplanation}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-semibold text-xs text-slate-600">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {showExplanation && (
                    <div>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-blue-800 font-semibold">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Explanation & Concept:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
                >
                  <span>{currentIdx < currentQuestions.length - 1 ? 'Next Question' : 'Restart Category'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
