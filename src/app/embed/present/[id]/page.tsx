'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import WordCloud from '@/components/polls/WordCloud';
import BarChart from '@/components/polls/BarChart';

export default function EmbedPresentPage() {
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

  if (!event) return <div className="h-screen bg-transparent text-gray-800 flex items-center justify-center font-sans">Loading...</div>;

  const activePoll = event.polls.find((p: any) => p.isActive);

  if (!activePoll) {
    return (
      <div className="h-screen bg-transparent flex items-center justify-center font-sans">
        <p className="text-gray-500 text-xl font-medium text-center">
          Waiting for host to activate a poll...
          <br/>
          <span className="text-blue-600 text-sm mt-2 block">Join at sahbhagi.app with code {event.code}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-gray-900 overflow-hidden flex flex-col font-sans p-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h3 className="text-3xl font-bold">{activePoll.question}</h3>
        <div className="text-right">
          <p className="text-gray-500">Join at <span className="font-bold text-blue-600">sahbhagi.app</span></p>
          <p className="text-2xl font-mono font-bold tracking-widest">{event.code}</p>
        </div>
      </div>
      
      {activePoll.type === 'multiple-choice' && (
        <div className="flex-1">
          <BarChart data={activePoll.options.map((opt: string) => ({
            name: opt,
            count: activePoll.responses.filter((r: any) => r.answer === opt).length
          }))} />
        </div>
      )}
      
      {activePoll.type === 'quiz' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-2xl mb-6">
            Correct Answer: <span className="font-bold text-green-600">{activePoll.correctAnswer}</span>
          </div>
          <div className="w-full max-w-md bg-gray-50 border rounded-xl p-4">
            <h4 className="text-xl font-semibold mb-4 text-center">Fastest Correct Answers</h4>
            <div className="space-y-2">
              {activePoll.responses
                .filter((r: any) => r.answer === activePoll.correctAnswer)
                .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .slice(0, 5)
                .map((r: any, idx: number) => (
                  <div key={idx} className="flex justify-between bg-white border p-3 rounded-lg shadow-sm">
                    <span className="font-medium">{idx + 1}. {r.userId}</span>
                    <span className="text-gray-400 text-sm">
                      {activePoll.startTime ? `${((new Date(r.timestamp).getTime() - new Date(activePoll.startTime).getTime()) / 1000).toFixed(1)}s` : ''}
                    </span>
                  </div>
                ))}
              {activePoll.responses.filter((r: any) => r.answer === activePoll.correctAnswer).length === 0 && (
                <div className="text-center text-gray-500 py-4">Waiting for correct answers...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activePoll.type === 'rating' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-8xl mb-4">⭐</div>
          <div className="text-6xl font-bold">
            {activePoll.responses.length > 0 
              ? (activePoll.responses.reduce((sum: number, r: any) => sum + parseInt(r.answer), 0) / activePoll.responses.length).toFixed(1)
              : '0.0'}
            <span className="text-3xl text-gray-400"> / 5.0</span>
          </div>
          <div className="text-xl text-gray-500 mt-4">
            {activePoll.responses.length} {activePoll.responses.length === 1 ? 'rating' : 'ratings'}
          </div>
        </div>
      )}
      
      {(activePoll.type === 'word-cloud' || activePoll.type === 'open-text') && (
        <div className="flex-1">
          <WordCloud words={
            Object.values(activePoll.responses.reduce((acc: any, r: any) => {
              acc[r.answer] = acc[r.answer] || { text: r.answer, value: 0 };
              acc[r.answer].value++;
              return acc;
            }, {}))
          } />
        </div>
      )}
    </div>
  );
}
