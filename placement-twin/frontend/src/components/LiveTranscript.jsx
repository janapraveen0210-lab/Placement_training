import React, { useRef, useEffect } from 'react';
import { Bot, User, MessageSquare } from 'lucide-react';

export default function LiveTranscript({ conversation = [] }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-64 md:h-72">
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-800">Live Interview Transcript</span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          {conversation.length} message{conversation.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 scroll-smooth bg-slate-50/30">
        {conversation.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center">
            <p>Transcript will appear here once the interview starts.</p>
          </div>
        ) : (
          conversation.map((msg, index) => {
            const isAI = msg.role === 'assistant';
            return (
              <div
                key={index}
                className={`flex gap-3 text-xs md:text-sm ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-medium shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-xl px-4 py-2.5 text-xs md:text-sm ${
                    isAI
                      ? 'bg-blue-50/70 border border-blue-100 text-slate-800'
                      : 'bg-white border border-slate-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className={`text-[11px] font-semibold ${isAI ? 'text-blue-700' : 'text-slate-700'}`}>
                      {isAI ? 'Interviewer (LiveAvatar)' : 'Candidate (You)'}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>

                {!isAI && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
