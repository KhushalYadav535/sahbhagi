const fs = require('fs');

const code = `'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import WordCloud from '@/components/polls/WordCloud';
import { Maximize, MessageSquare, QrCode } from 'lucide-react';

export default function PresentPage() {
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchEvent();
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-event', params.id);
    });

    newSocket.on('poll-response', (data) => {
      fetchEvent();
    });

    newSocket.on('new-question', (data) => {
      fetchEvent();
    });

    newSocket.on('poll-state-changed', (data) => {
      fetchEvent();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(\`/events/\${params.id}\`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!event) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  );

  const activePolls = event.polls.filter((p: any) => p.isActive);
  const joinUrl = typeof window !== 'undefined' ? \`\${window.location.origin}/event/\${event.code}\` : \`sahbhagi.app/event/\${event.code}\`;
  const qrUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=\${encodeURIComponent(joinUrl)}\`;

  return (
    <div className="h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#171131] to-slate-950 text-white overflow-hidden flex font-sans">
      
      {/* LEFT PANEL: Join Info & QR Code */}
      <div className="w-[30%] min-w-[350px] border-r border-white/10 flex flex-col p-10 bg-slate-950/50 backdrop-blur-sm z-10 shrink-0">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-slate-300 mb-8 text-center tracking-wide">Join the conversation</h2>
          
          <div className="bg-white p-4 rounded-3xl shadow-2xl mb-8">
            <img src={qrUrl} alt="Join QR Code" className="w-48 h-48 sm:w-64 sm:h-64 object-contain" />
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-lg mb-2">Join at <span className="text-blue-400 font-mono font-bold tracking-wider">sahbhagi.app</span></p>
            <p className="text-slate-500 text-base mb-1">with code</p>
            <div className="text-5xl font-extrabold tracking-widest text-white drop-shadow-md">
              #{event.code}
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-between items-center text-slate-500 pt-8 border-t border-white/10">
           <span className="font-semibold">{event.title}</span>
           <button onClick={() => document.documentElement.requestFullscreen()} className="hover:text-white transition p-2 bg-white/5 rounded-full hover:bg-white/10">
             <Maximize size={20} />
           </button>
        </div>
      </div>

      {/* RIGHT PANEL: Main Stage */}
      <div className="flex-1 relative flex flex-col p-12 overflow-hidden">
        {activePolls.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 animate-pulse">
              <MessageSquare size={40} className="text-slate-600" />
            </div>
            <h2 className="text-3xl font-semibold text-slate-400 text-center max-w-lg leading-relaxed">
              Waiting for the host to launch an interaction...
            </h2>
          </div>
        ) : (
          activePolls.map((poll: any) => {
            const totalVotes = poll.responses ? poll.responses.length : 0;
            return (
              <div key={poll._id} className="flex-1 flex flex-col w-full max-w-6xl mx-auto h-full animate-in fade-in zoom-in-95 duration-500">
                
                {/* Poll Header */}
                <div className="mb-12 text-center">
                  <h1 className="text-5xl md:text-6xl font-bold leading-tight drop-shadow-xl text-white">
                    {poll.question}
                  </h1>
                  <p className="text-slate-400 text-xl mt-6 font-medium tracking-wide">
                    {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                  </p>
                </div>

                {/* Poll Visualizations */}
                <div className="flex-1 flex flex-col justify-center h-full w-full">
                  {poll.type === 'multiple-choice' && (
                    <div className="flex-1 flex flex-col justify-center w-full max-w-4xl mx-auto space-y-6">
                      {poll.options.map((opt: string, idx: number) => {
                        const count = poll.responses.filter((r: any) => r.answer === opt).length;
                        const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                        // We use a beautiful vibrant blue gradient for the bars
                        return (
                          <div key={idx} className="relative h-20 w-full flex items-center bg-slate-800/40 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                            {/* Animated Background Bar */}
                            <div 
                              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl transition-all duration-[800ms] ease-out shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                              style={{ width: \`\${percentage}%\` }}
                            ></div>
                            
                            {/* Content Overlays */}
                            <div className="relative z-10 flex justify-between items-center w-full px-8 font-semibold text-2xl tracking-wide">
                              <span className="text-white drop-shadow-md truncate pr-4">{opt}</span>
                              <div className="flex items-center gap-6 shrink-0">
                                <span className="text-white/60 text-xl font-mono">{count}</span>
                                <span className="text-white w-16 text-right drop-shadow-md">{percentage}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {poll.type === 'word-cloud' && (
                    <div className="flex-1 w-full h-full min-h-[400px] flex items-center justify-center p-8 bg-slate-900/50 rounded-3xl border border-white/10 shadow-2xl">
                      <WordCloud words={poll.responses.map((r: any) => r.answer)} />
                    </div>
                  )}

                  {poll.type === 'quiz' && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="text-3xl mb-12 text-slate-300">
                        Correct Answer: <span className="font-bold text-green-400 drop-shadow-md text-4xl ml-3">{poll.correctAnswer}</span>
                      </div>
                      <div className="w-full max-w-2xl bg-slate-800/60 rounded-3xl p-10 border border-white/10 shadow-2xl backdrop-blur-md">
                        <h4 className="text-2xl font-bold mb-8 text-center text-white tracking-wide">Fastest Correct Answers</h4>
                        <div className="space-y-4">
                          {poll.responses
                            .filter((r: any) => r.answer === poll.correctAnswer)
                            .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                            .slice(0, 5)
                            .map((r: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 text-xl font-medium">
                                <div className="flex items-center gap-4">
                                  <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                                  <span className="text-white">{r.userId}</span>
                                </div>
                                <span className="text-blue-300 font-mono">
                                  {poll.startTime ? \`\${((new Date(r.timestamp).getTime() - new Date(poll.startTime).getTime()) / 1000).toFixed(1)}s\` : ''}
                                </span>
                              </div>
                            ))}
                          {poll.responses.filter((r: any) => r.answer === poll.correctAnswer).length === 0 && (
                            <p className="text-center text-slate-500 py-6 text-lg">No correct answers yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {poll.type === 'qna' && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <h2 className="text-3xl text-slate-400">Please switch to the Q&A tab on your device to submit questions.</h2>
                    </div>
                  )}

                  {(poll.type === 'open-text' || poll.type === 'rating' || poll.type === 'ranking') && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/10 text-center max-w-2xl">
                         <h3 className="text-2xl font-semibold text-white mb-4">Responses are coming in!</h3>
                         <p className="text-slate-400 text-lg">Check your device to participate. Full results view for this interaction type will be available soon.</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
`;

fs.writeFileSync('src/app/event/[id]/present/page.tsx', code);
console.log('Present UI completely rebuilt!');
