'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';
import { Zap, MessageSquare, BarChart3, Sparkles, Globe, ChevronDown, Users, TrendingUp, ArrowRight } from 'lucide-react';

const features = [
  { icon: <MessageSquare className="w-6 h-6 text-emerald-600" />, title: 'Live Q&A', description: 'Collect and prioritize questions from your audience.' },
  { icon: <Zap className="w-6 h-6 text-emerald-600" />, title: 'Live Polls', description: 'Create interactive polls with real-time results.' },
  { icon: <Sparkles className="w-6 h-6 text-emerald-600" />, title: 'AI-powered', description: 'Generate polls and questions with AI assistance.' },
  { icon: <Globe className="w-6 h-6 text-emerald-600" />, title: 'Multi-language', description: 'Available in multiple languages.' },
  { icon: <Users className="w-6 h-6 text-emerald-600" />, title: 'Engagement', description: 'Boost audience participation effortlessly.' },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/sahbhagi_logo.png"
                alt="Sahbhagi"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Sahbhagi
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/login')}
                className="px-5 py-2.5 text-slate-700 font-bold hover:bg-slate-100 rounded-full transition"
              >
                Log in
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition shadow-sm"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-7xl lg:text-[80px] font-extrabold text-slate-900 mb-8 leading-[1.1] tracking-tight">
            Your audience is <br />
            <span className="text-emerald-600">listening.</span> Engage them.
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Collect live questions, run interactive polls, and brainstorm ideas with Sahbhagi.
          </p>
          
          {/* Join Input Box */}
          <div className="max-w-2xl mx-auto bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row gap-3 mb-16 relative hover:shadow-2xl hover:shadow-slate-200/80 transition-shadow duration-300">
            <div className="flex-1 relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl select-none">#</div>
              <input 
                type="text" 
                placeholder="Enter event code" 
                className="w-full h-16 pl-14 pr-6 bg-slate-50 border-none rounded-xl text-2xl font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none uppercase tracking-wider"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    router.push(`/join?code=${e.currentTarget.value}`);
                  }
                }}
              />
            </div>
            <button 
              className="h-16 px-10 bg-emerald-600 text-white font-extrabold text-lg rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 group shrink-0"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling?.querySelector('input');
                if (input?.value) {
                  router.push(`/join?code=${input.value}`);
                } else {
                  router.push('/join');
                }
              }}
            >
              Join
              <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Or create your own</p>
          <button
            onClick={() => router.push('/register')}
            className="px-8 py-3 bg-white text-slate-800 font-bold text-base rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition shadow-sm"
          >
            Get started for free
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Everything you need to engage</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">All the tools to make your meetings, classes, and events unforgettably interactive.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-emerald-600 text-white text-center relative overflow-hidden">
        {/* Subtle pattern background for CTA */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-8 tracking-tight">Ready to get started?</h2>
          <p className="text-xl md:text-2xl text-emerald-100 mb-12 font-medium max-w-2xl mx-auto leading-relaxed">Join thousands of people making their meetings more interactive with Sahbhagi.</p>
          <button
            onClick={() => router.push('/register')}
            className="px-12 py-5 bg-white text-emerald-700 font-extrabold text-xl rounded-full hover:bg-emerald-50 hover:scale-105 transition-all shadow-xl shadow-emerald-900/20"
          >
            Sign up for free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <Image
                src="/sahbhagi_logo.png"
                alt="Sahbhagi"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-white">Sahbhagi</span>
            </div>
            <p className="text-slate-400">© 2026 Sahbhagi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
