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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="px-5 py-2 text-slate-700 font-medium hover:text-emerald-600 transition"
              >
                Log in
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
              >
                Sign up free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
            Make every meeting
            <br />
            <span className="text-emerald-600">interactive</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Collect live poll responses, crowd-sourced questions, and feedback with Sahbhagi — the easiest way to engage your audience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => router.push('/register')}
              className="group flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white font-bold text-lg rounded-lg hover:bg-emerald-700 transition shadow-lg hover:shadow-emerald-200"
            >
              Get started for free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => router.push('/join')}
              className="px-10 py-4 bg-white text-slate-800 font-bold text-lg rounded-lg border border-slate-300 hover:border-emerald-300 hover:bg-emerald-50 transition"
            >
              Join an event
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Everything you need to engage</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">All the tools to make your meetings, classes, and events interactive.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Ready to get started?</h2>
          <p className="text-xl text-slate-600 mb-10">Join thousands of people making their meetings more interactive with Sahbhagi.</p>
          <button
            onClick={() => router.push('/register')}
            className="px-10 py-4 bg-emerald-600 text-white font-bold text-lg rounded-lg hover:bg-emerald-700 transition shadow-lg"
          >
            Sign up free
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
