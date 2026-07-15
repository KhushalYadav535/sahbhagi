'use client';

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
      const res = await api.get(`/events/${params.id}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!event) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
    </div>
  );

  const activePolls = event.polls.filter((p: any) => p.isActive);
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join?code=${event.code}` : `sahbhagi.app/join?code=${event.code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(joinUrl)}`;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 overflow-hidden flex font-sans selection:bg-emerald-100">
      
      {/* LEFT PANEL: Join Info & QR Code */}
      <div className="w-[30%] min-w-[320px] max-w-[400px] border-r border-slate-200 flex flex-col p-10 bg-white shadow-xl z-20 shrink-0 overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center min-h-min py-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center tracking-wide">Join at</h2>
          
          <div className="text-center mb-8">
            <div className="inline-block bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-3 rounded-2xl text-3xl font-bold tracking-wider font-mono mb-4 shadow-sm">
              sahbhagi.app
            </div>
          </div>

          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl mb-8 transform hover:scale-105 transition-transform duration-500">
            <img src={qrUrl} alt="Join QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
          </div>

          <div className="text-center">
            <p className="text-slate-500 text-lg mb-2 font-medium">with code</p>
            <div className="text-5xl sm:text-6xl font-extrabold tracking-widest text-slate-900 drop-shadow-sm">
              <span className="text-emerald-500">#</span>{event.code}
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-between items-center text-slate-500 pt-8 border-t border-slate-100">
           <span className="font-bold text-slate-700 truncate pr-4">{event.title}</span>
           <button onClick={() => document.documentElement.requestFullscreen()} className="hover:text-slate-900 transition p-3 bg-slate-50 rounded-full hover:bg-slate-100 border border-slate-200">
             <Maximize size={20} />
           </button>
        </div>
      </div>

      {/* RIGHT PANEL: Main Stage */}
      <div className="flex-1 relative flex flex-col p-8 sm:p-16 overflow-y-auto bg-slate-50 z-10">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        {activePolls.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center relative z-10 my-auto">
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white border border-slate-200 flex items-center justify-center animate-pulse shadow-xl">
                <MessageSquare size={48} className="text-slate-300" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-400 text-center max-w-lg leading-relaxed">
              Waiting for the host to launch an interaction...
            </h2>
          </div>
        ) : (
          activePolls.map((poll: any) => {
            const totalVotes = poll.responses ? poll.responses.length : 0;
            return (
              <div key={poll._id} className="w-full max-w-6xl mx-auto flex flex-col shrink-0 animate-in fade-in zoom-in-95 duration-700 relative z-10 mb-20 last:mb-0">
                
                {/* Poll Header */}
                <div className="mb-6 text-center pt-6 shrink-0 flex flex-col items-center">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-slate-900 tracking-tight drop-shadow-sm max-w-4xl mx-auto break-words">
                    {poll.question}
                  </h1>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <p className="text-slate-600 text-xs font-semibold tracking-wide">
                      {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                    </p>
                  </div>
                </div>

                {/* Poll Visualizations */}
                <div className="flex flex-col items-center w-full relative flex-1">
                  {poll.type === 'multiple-choice' && (
                    <div className="w-full max-w-3xl flex flex-col gap-3">
                      {poll.options.map((opt: string, idx: number) => {
                        const count = poll.responses.filter((r: any) => r.answer === opt).length;
                        const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                        return (
                          <div key={idx} className="relative h-12 sm:h-14 w-full flex items-center bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm group shrink-0">
                            {/* Animated Background Bar */}
                            <div 
                              className="absolute top-0 left-0 bottom-0 bg-emerald-100 transition-all duration-[1000ms] ease-out border-r-[3px] border-emerald-400 opacity-90" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                            
                            {/* Content Overlays */}
                            <div className="relative z-10 flex justify-between items-center w-full px-4 sm:px-6 font-medium text-base sm:text-lg tracking-wide gap-4">
                              <span className="text-slate-800 drop-shadow-sm truncate flex-1">{opt}</span>
                              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                <span className="text-slate-500 text-sm sm:text-base font-mono">{count}</span>
                                <span className="text-slate-900 w-12 sm:w-14 text-right font-bold text-lg sm:text-xl">{percentage}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {poll.type === 'word-cloud' && (
                    <div className="w-full min-h-[500px] flex items-center justify-center p-12 bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden mb-12">
                      <WordCloud words={(() => {
                        const counts: Record<string, number> = {};
                        poll.responses.forEach((r: any) => {
                          const w = r.answer?.trim();
                          if (w) counts[w] = (counts[w] || 0) + 1;
                        });
                        return Object.entries(counts).map(([text, value]) => ({ text, value }));
                      })()} />
                    </div>
                  )}

                  {poll.type === 'quiz' && (
                    <div className="w-full flex flex-col items-center justify-center pb-12">
                      <div className="text-4xl mb-12 text-slate-500 font-bold">
                        Correct Answer: <span className="font-extrabold text-emerald-600 text-5xl ml-4 tracking-wide">{poll.correctAnswer}</span>
                      </div>
                      <div className="w-full max-w-3xl bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl">
                        <h4 className="text-3xl font-extrabold mb-10 text-center text-slate-900 tracking-wide">Fastest Correct Answers</h4>
                        <div className="space-y-5">
                          {poll.responses
                            .filter((r: any) => r.answer === poll.correctAnswer)
                            .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                            .slice(0, 5)
                            .map((r: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100 text-2xl font-bold">
                                <div className="flex items-center gap-5">
                                  <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                                    idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    idx === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                                    idx === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span className="text-slate-800">{r.userId}</span>
                                </div>
                                <span className="text-emerald-600 font-mono font-bold tracking-wider">
                                  {poll.startTime ? `${((new Date(r.timestamp).getTime() - new Date(poll.startTime).getTime()) / 1000).toFixed(1)}s` : ''}
                                </span>
                              </div>
                            ))}
                          {poll.responses.filter((r: any) => r.answer === poll.correctAnswer).length === 0 && (
                            <p className="text-center text-slate-500 py-10 text-xl font-medium">No correct answers yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {poll.type === 'qna' && (
                    <div className="w-full flex flex-col items-center justify-center pb-12">
                      <h2 className="text-4xl font-bold text-slate-400 text-center">Please switch to the Q&A tab on your device to submit questions.</h2>
                    </div>
                  )}

                  {poll.type === 'open-text' && (
                    <div className="w-full flex flex-wrap content-start items-start justify-center gap-6 pb-12">
                      {poll.responses.map((r: any, idx: number) => (
                        <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-md text-3xl font-bold text-slate-800 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl break-words">
                          {r.answer}
                        </div>
                      ))}
                      {poll.responses.length === 0 && (
                        <div className="w-full text-center text-slate-400 text-3xl mt-20 font-bold">Waiting for responses...</div>
                      )}
                    </div>
                  )}

                  {(poll.type === 'rating' || poll.type === 'ranking') && (
                    <div className="w-full flex flex-col items-center justify-center pb-12">
                      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl text-center max-w-3xl">
                         <h3 className="text-4xl font-extrabold text-slate-900 mb-6">Responses are coming in!</h3>
                         <p className="text-slate-500 text-2xl leading-relaxed font-medium">Check your device to participate. Full results view for this interaction type will be available soon.</p>
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
