'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowRight, Search } from 'lucide-react';

export default function Join() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/events/code/${code.trim().toUpperCase()}`);
      router.push(`/event/${res.data._id}`);
    } catch (err) {
      toast.error('Event not found. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <Image
              src="/sahbhagi_logo.png"
              alt="Sahbhagi"
              width={56}
              height={56}
              className="rounded-lg"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Sahbhagi
            </span>
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Join an event</h1>
          <p className="text-lg text-slate-600">Enter the event code provided by your host</p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-slate-800 mb-2">
              Event code
            </label>
            <div className="relative">
              <input
                id="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="w-full px-4 py-4 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-2xl font-bold uppercase tracking-widest"
                placeholder="ABC123"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-emerald-600 text-white font-bold text-xl rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Join event
                <ArrowRight size={24} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-10 text-center text-lg text-slate-600">
          Want to host your own event?{' '}
          <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
