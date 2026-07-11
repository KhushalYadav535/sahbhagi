'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  Plus,
  LogOut,
  Calendar,
  Copy,
  ArrowRight,
  Trash2,
  Settings,
  Home,
  BarChart3,
  MessageSquare,
  Sparkles,
  LayoutDashboard
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

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Event code copied!');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/sahbhagi_logo.png"
                alt="Sahbhagi"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-slate-900">
                {user?.name}
              </span>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                Upgrade
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-500 text-sm">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-slate-500 text-sm font-mono">{Math.floor(Math.random() * 9000000) + 1000000}</span>
              <button
                onClick={() => toast.success('Public link copied!')}
                className="px-4 py-2 border border-violet-500 text-violet-600 font-semibold rounded-lg hover:bg-violet-50 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="border-r border-violet-300 pr-2">Share</span>
                  <span>Publish</span>
                </div>
              </button>
              <button
                onClick={() => toast.success('Present mode opening!')}
                className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
              >
                Present
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 sticky top-24">
              <div className="flex gap-2 mb-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition">
                  <Plus size={18} /> Add
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition">
                  <LayoutDashboard size={18} /> Templates
                </button>
              </div>
              
              <nav className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                  Audience Q&A
                </div>
                <button className="w-full flex items-center gap-3 px-3 py-3 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-200">
                  <MessageSquare size={18} />
                  <div className="text-left">
                    <div className="text-sm">Add Q&A to collect questions from your audience</div>
                    <div className="text-xs text-emerald-600 font-bold">Add</div>
                  </div>
                </button>
              </nav>
              
              <div className="mt-8 px-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Polls
                </div>
                <p className="text-sm text-slate-500">Your interactions will appear here</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Events</h1>
                <p className="text-slate-500">Manage your events and create new ones</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition shadow-sm"
              >
                <Plus size={20} />
                Create event
              </button>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">No events yet</h3>
                <p className="text-lg text-slate-500 mb-8">Create your first event to get started</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white font-bold text-lg rounded-lg hover:bg-violet-700 transition"
                >
                  <Plus size={22} />
                  Create event
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                            {event.description && (
                              <p className="text-slate-500 mt-1">{event.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="text-slate-400 hover:text-red-600 transition p-1"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="text-slate-600">
                              {new Date(event.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm">
                              {event.code}
                            </div>
                            <button
                              onClick={() => copyCode(event.code)}
                              className="text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1"
                            >
                              <Copy size={14} />
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/event/${event._id}`)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition"
                      >
                        Open
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Create new event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-slate-800 mb-2">
                  Event name
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-5 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-lg"
                  placeholder="e.g., Team Meeting"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-slate-800 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-5 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-lg"
                  rows={3}
                  placeholder="What's this event about?"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-4 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
