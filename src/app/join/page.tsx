'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowRight, Search, User, Mail } from 'lucide-react';

function JoinForm() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam.toUpperCase());
    }
    // Try to load previously saved details
    const savedName = localStorage.getItem('participantName');
    const savedEmail = localStorage.getItem('participantEmail');
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, [searchParams]);

  const handleJoin = async (joinCode: string) => {
    if (!joinCode.trim() || !name.trim() || !email.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/events/${joinCode.trim().toUpperCase()}`);
      localStorage.setItem('participantName', name.trim());
      localStorage.setItem('participantEmail', email.trim());
      localStorage.setItem('userId', name.trim()); // Use name as userId for polls/qna
      router.push(`/event/${res.data._id}?participant=true`);
    } catch (err) {
      toast.error('Event not found. Please check the code and try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin(code);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1000px] opacity-40 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-[480px] w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
              <Image
                src="/sahbhagi_logo.png"
                alt="Sahbhagi"
                width={48}
                height={48}
                className="rounded-lg"
              />
            </div>
            <span className="text-4xl font-extrabold text-slate-800 tracking-tight">
              Sahbhagi
            </span>
          </Link>
        </div>

        {/* Join Card */}
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 backdrop-blur-sm">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-8 text-center tracking-tight">Join an event</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl select-none">#</div>
                <input
                  id="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="w-full h-16 pl-12 pr-6 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-2xl font-bold uppercase tracking-wider text-slate-800 placeholder-slate-400 outline-none"
                  placeholder="Enter code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-base font-semibold text-slate-800 placeholder-slate-400 outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-base font-semibold text-slate-800 placeholder-slate-400 outline-none"
                  placeholder="Email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 flex items-center justify-center gap-3 bg-emerald-600 text-white font-extrabold text-xl rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 mt-8 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Join event
                  <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-slate-500 font-medium">
          Want to host your own event?{' '}
          <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-4 transition">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Join() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div></div>}>
      <JoinForm />
    </Suspense>
  );
}
