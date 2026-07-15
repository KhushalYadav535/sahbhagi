'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Plus,
  LogOut,
  Calendar,
  Copy,
  ArrowRight,
  Trash2,
  Settings,
  MoreVertical,
  Users
} from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  code: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchEvents();
    }
  }, [user, authLoading, router]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/events', newEvent);
      setEvents([res.data, ...events]);
      setIsModalOpen(false);
      setNewEvent({ title: '', description: '' });
      toast.success('Event created successfully!');
    } catch (err) {
      toast.error('Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const copyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    navigator.clipboard.writeText(code);
    toast.success('Event code copied!');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <div className="text-slate-500 font-medium">Loading your events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                <Image
                  src="/sahbhagi_logo.png"
                  alt="Sahbhagi"
                  width={32}
                  height={32}
                  className="rounded"
                />
              </div>
              <span className="text-xl font-extrabold text-slate-800 tracking-tight">
                Sahbhagi
              </span>
            </Link>
            
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition shadow-sm"
              >
                <Plus size={18} strokeWidth={3} />
                New Event
              </button>
              
              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm uppercase">
                  {user?.name?.charAt(0)}
                </div>
                <span className="font-semibold text-sm text-slate-700 hidden sm:block">{user?.name}</span>
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 transition rounded-full hover:bg-red-50"
                  title="Log out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Your Events</h1>
            <p className="text-slate-500 font-medium">Manage your active events and create new ones.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="md:hidden flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus size={20} strokeWidth={3} />
            New Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">No events yet</h3>
            <p className="text-lg text-slate-500 mb-8 max-w-sm mx-auto font-medium">Create your first event to start collecting live feedback and running polls.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold text-lg rounded-full hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
            >
              <Plus size={22} strokeWidth={3} />
              Create your first event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => router.push(`/event/${event._id}`)}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all cursor-pointer group flex flex-col h-[240px]"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 font-mono tracking-widest border border-slate-200/50">
                      <span className="text-slate-400">#</span>
                      {event.code}
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteEvent(event._id, e)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
                      title="Delete event"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">{event.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 font-medium flex-1">
                    {event.description || "No description provided."}
                  </p>
                </div>
                
                <div className="p-6 border-t border-slate-50 bg-slate-50/50 rounded-b-3xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Calendar size={14} />
                    {new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    Open <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50">
              <h2 className="text-2xl font-extrabold text-slate-900">Create new event</h2>
              <p className="text-slate-500 font-medium mt-1">Setup your interaction space</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
                    Event name
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-base font-semibold text-slate-800 placeholder-slate-400 outline-none"
                    placeholder="e.g., Q3 Townhall"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
                    Description <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-base font-semibold text-slate-800 placeholder-slate-400 outline-none resize-none"
                    rows={3}
                    placeholder="What's this event about?"
                  />
                </div>
                <div className="flex gap-4 pt-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg shadow-emerald-600/20 flex items-center justify-center"
                  >
                    {creating ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Create event'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
