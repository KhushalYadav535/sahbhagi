"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Eye, Lock, List, Cloud, AlignLeft, ListOrdered, Star, Trophy, MoreVertical } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import CreateInteractionView from "@/components/polls/CreateInteractionView";
import SharePopover from "@/components/SharePopover";
import {
  BarChart, LayoutTemplate, ChevronLeft, ChevronRight,
  MessageSquare,
  ThumbsUp,
  Settings,
  XCircle,
  Plus,
  Play,
  Square,
  Sparkles,
  Download,
  Upload,
  Users,
  BookOpen,
  Check,
  X,
  ArrowLeft,
  CheckCircle,
  Trash2,
  Globe,
  Share2,
  Monitor,
} from "lucide-react";
import RankingPollParticipant from "@/components/polls/RankingPollParticipant";

interface Poll {
  _id: string;
  question: string;
  type: string;
  options: string[];
  responses: any[];
  isActive: boolean;
}

interface Question {
  _id: string;
  text: string;
  author: string;
  isAnonymous: boolean;
  upvotes: string[];
  isApproved: boolean;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  code: string;
  host: string;
  language: string;
  polls: Poll[];
  questions: Question[];
}


const getPollIcon = (type: string) => {
  switch(type) {
    case 'qna': return <MessageSquare size={16} className="text-red-500" />;
    case 'multiple-choice': return <List size={16} className="text-blue-600" />;
    case 'word-cloud': return <Cloud size={16} className="text-purple-600" />;
    case 'open-text': return <AlignLeft size={16} className="text-emerald-600" />;
    case 'ranking': return <ListOrdered size={16} className="text-pink-600" />;
    case 'rating': return <Star size={16} className="text-yellow-600" />;
    case 'quiz': return <Trophy size={16} className="text-orange-600" />;
    default: return <List size={16} className="text-slate-500" />;
  }
}

export default function EventPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isParticipant = searchParams.get("participant") === "true";
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("create");
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [summarizedThemes, setSummarizedThemes] = useState<any[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGettingInsight, setIsGettingInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${params.id}`);
      setEvent(res.data);
    } catch (err) {
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePoll = async (pollId: string, isActive: boolean) => {
    try {
      await api.put(`/polls/${pollId}`, { isActive });
      setEvent((prev: any) => ({
        ...prev,
        polls: prev.polls.map((p: Poll) =>
          p._id === pollId ? { ...p, isActive } : p,
        ),
      }));
    } catch (err) {
      toast.error("Failed to update poll");
    }
  };

  const handleReact = async (pollId: string, responseId: string, emoji: string) => {
    try {
      await api.post(`/events/${params.id}/polls/${pollId}/responses/${responseId}/react`, { emoji });
      fetchEvent();
    } catch (err) {
      console.error('Error reacting', err);
    }
  };

  const handlePollResponse = async (pollId: string, answer: any) => {
    try {
      const userId = localStorage.getItem("userId") || `user_${Date.now()}`;
      localStorage.setItem("userId", userId);
      await api.post(`/polls/${pollId}/respond`, { userId, answer });
      fetchEvent();
      toast.success("Response submitted!");
    } catch (err) {
      toast.error("Failed to submit response");
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Question submitted!");
    setNewQuestion("");
  };

  const handleExport = async () => {
    try {
      const res = await api.get(`/events/${params.id}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `event_${params.id}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to export data");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      await api.post(`/events/${params.id}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchEvent();
      toast.success("Polls imported successfully!");
    } catch (err) {
      toast.error("Failed to import polls");
      setLoading(false);
    }
  };

  const handleImportRoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      await api.post(`/events/${params.id}/roster/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchEvent();
      toast.success("Roster imported successfully!");
    } catch (err) {
      toast.error("Failed to import roster");
      setLoading(false);
    }
  };

  const handleSummarizeQnA = async () => {
    try {
      setIsSummarizing(true);
      const responses = event.questions.map((q: any) => q.text);
      if (responses.length === 0) {
        toast.error("No questions to summarize");
        setIsSummarizing(false);
        return;
      }
      const res = await api.post("/ai/summarize-responses", { responses });
      setSummarizedThemes(res.data.themes || []);
      toast.success("Summarized successfully!");
    } catch (err) {
      toast.error("Failed to summarize");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGetInsight = async () => {
    try {
      setIsGettingInsight(true);
      const res = await api.post("/ai/recommend-interaction", {
        eventState: {
          pollsActive: event.polls.filter((p: any) => p.isActive).length,
          questionsCount: event.questions.length,
        },
      });
      setAiInsight(res.data.recommendation);
      toast.success("AI Insight received!", { icon: "🤖" });
    } catch (err) {
      toast.error("Failed to get AI Insight");
    } finally {
      setIsGettingInsight(false);
    }
  };

  const handleModerateQuestion = async (
    questionId: string,
    isApproved: boolean,
  ) => {
    try {
      await api.patch(`/events/${params.id}/questions/${questionId}`, {
        isApproved,
      });
      toast.success(isApproved ? "Question approved" : "Question rejected");
      fetchEvent();
    } catch (err) {
      toast.error("Failed to moderate question");
    }
  };

  const handleSyncLms = async () => {
    try {
      setLoading(true);
      await api.post(`/events/${params.id}/lms/sync`);
      toast.success("Successfully synced grades to LMS!");
    } catch (err) {
      toast.error("Failed to sync with LMS");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Event not found
          </h2>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Go back home
          </Link>
        </div>
      </div>
    );
  }


  if (isParticipant) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <button
                onClick={() =>
                  router.push(isParticipant ? "/join" : "/dashboard")
                }
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <div className="flex items-center gap-3">
                <Image
                  src="/sahbhagi_logo.png"
                  alt="Sahbhagi"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-lg font-bold text-slate-900">
                    {event.title}
                  </h1>
                  {!isParticipant && (
                    <p className="text-sm text-slate-500">Code: {event.code}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {isParticipant && (
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-slate-500" />
                  <select
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="border border-slate-300 rounded-md py-1 px-3 text-sm text-slate-700 bg-white"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="mr">मराठी</option>
                    <option value="ta">தமிழ்</option>
                    <option value="te">తెలుగు</option>
                    <option value="bn">বাংলা</option>
                  </select>
                </div>
              )}
              {!isParticipant && (
                <>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                  >
                    <Download size={20} />
                    Export CSV
                  </button>
                  <button
                    onClick={handleSyncLms}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition"
                  >
                    <BookOpen size={20} />
                    Sync to LMS
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer font-medium">
                    <Upload size={20} />
                    Import Polls
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx, .csv"
                      onChange={handleImport}
                    />
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer font-medium">
                    <Users size={20} />
                    Upload Roster
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx, .csv"
                      onChange={handleImportRoster}
                    />
                  </label>
                  <button
                    onClick={() => setShowCreatePoll(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    <Sparkles size={20} />
                    AI Generate
                  </button>
                  <button
                    onClick={handleGetInsight}
                    disabled={isGettingInsight}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 font-semibold rounded-lg hover:bg-yellow-200 transition"
                  >
                    <Sparkles size={20} />
                    {isGettingInsight ? "..." : "Get Insight"}
                  </button>
                  <button
                    onClick={() => router.push(`/event/${params.id}/present`)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 font-semibold rounded-lg hover:bg-teal-200 transition"
                  >
                    <Monitor size={20} />
                    Present
                  </button>
                  <button
                    onClick={() => setShowSharePopover(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 border border-gray-200 transition shadow-sm"
                  >
                    <Share2 size={20} />
                    Share
                  </button>
                  <button
                    onClick={() => setShowCreatePoll(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
                  >
                    <Plus size={20} />
                    New Poll
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {aiInsight && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-6 rounded-xl flex items-start gap-4">
            <div className="bg-white p-3 rounded-lg text-purple-600 shadow-sm">
              <Sparkles size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-900 text-lg">AI Co-Host Insight</h3>
              <p className="text-purple-800 mt-2 text-lg">{aiInsight}</p>
            </div>
            <button
              onClick={() => setAiInsight(null)}
              className="ml-auto text-purple-400 hover:text-purple-700 transition p-1"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Live Polls</h2>
            {event.polls.map((poll) => (
              <div
                key={poll._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    {poll.question}
                  </h3>
                  {!isParticipant && (
                    <button
                      onClick={() => handleTogglePoll(poll._id, !poll.isActive)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        poll.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {poll.isActive ? "Active" : "Inactive"}
                    </button>
                  )}
                </div>

                {(poll.type === "multiple-choice" || poll.type === "quiz") && (
                  <div className="space-y-4">
                    {poll.options.map((option, idx) => {
                      const count = poll.responses.filter(
                        (r: any) => r.answer === option,
                      ).length;
                      const total = poll.responses.length;
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={idx}>
                          {isParticipant && poll.isActive ? (
                            <button
                              onClick={() =>
                                handlePollResponse(poll._id, option)
                              }
                              className="w-full text-left px-6 py-4 border-2 border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition font-medium text-lg"
                            >
                              {option}
                            </button>
                          ) : (
                            <div className="relative">
                              <div
                                className="absolute top-0 left-0 h-full bg-emerald-100 rounded-xl transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                              <div className="relative px-6 py-4 flex justify-between items-center">
                                <span className="font-semibold text-slate-900 text-lg">
                                  {option}
                                  {poll.type === "quiz" &&
                                    poll.correctAnswer === option &&
                                    " ✅"}
                                </span>
                                <span className="text-sm font-semibold text-slate-600">
                                  {count} votes
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {poll.type === "rating" && (
                  <div className="flex justify-center items-center gap-4 py-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        disabled={!isParticipant || !poll.isActive}
                        onClick={() =>
                          handlePollResponse(poll._id, star.toString())
                        }
                        className={`text-5xl ${!isParticipant || !poll.isActive ? "cursor-default opacity-50" : "hover:scale-125 transition cursor-pointer"}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                )}

                {poll.type === "ranking" && (
                  <div className="space-y-4 pt-2">
                    {isParticipant && poll.isActive ? (
                      <RankingPollParticipant
                        poll={poll}
                        onSubmit={(answer) =>
                          handlePollResponse(poll._id, answer)
                        }
                      />
                    ) : (
                      <div className="space-y-3">
                        {(() => {
                          const scores: { [key: string]: number } = {};
                          poll.options.forEach(
                            (opt: string) => (scores[opt] = 0),
                          );
                          let totalScore = 0;
                          poll.responses.forEach((r: any) => {
                            if (Array.isArray(r.answer)) {
                              r.answer.forEach((opt: string, idx: number) => {
                                const pts = poll.options.length - idx;
                                if (scores[opt] !== undefined)
                                  scores[opt] += pts;
                                totalScore += pts;
                              });
                            }
                          });
                          const sorted = Object.keys(scores).sort(
                            (a, b) => scores[b] - scores[a],
                          );
                          return sorted.map((opt, idx) => {
                            const percentage =
                              totalScore > 0
                                ? (scores[opt] / totalScore) * 100
                                : 0;
                            return (
                              <div key={opt} className="relative">
                                <div
                                  className="absolute top-0 left-0 h-full bg-emerald-100 rounded-xl transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                                <div className="relative px-6 py-4 flex justify-between items-center">
                                  <div className="flex items-center gap-4">
                                    <span className="font-extrabold text-emerald-700 text-lg w-6">
                                      {idx + 1}.
                                    </span>
                                    <span className="font-semibold text-slate-900 text-lg">
                                      {opt}
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold text-slate-600">
                                    {scores[opt]} pts
                                  </span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {poll.type === "word-cloud" && (
                  <div className="flex flex-wrap gap-3 p-6 bg-slate-50 rounded-xl">
                    {poll.responses.map((r: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
                      >
                        {r.answer}
                      </span>
                    ))}
                    {isParticipant && poll.isActive && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.target as HTMLFormElement;
                          const answer = (
                            input.elements.namedItem(
                              "answer",
                            ) as HTMLInputElement
                          ).value;
                          if (answer) {
                            handlePollResponse(poll._id, answer);
                            input.reset();
                          }
                        }}
                        className="flex gap-3 items-center"
                      >
                        <input
                          name="answer"
                          type="text"
                          placeholder="Add a word..."
                          className="px-4 py-2 border border-slate-300 rounded-full text-sm bg-white"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 transition"
                        >
                          Add
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {poll.type === "open-text" && (
                  <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                    <div className="grid grid-cols-1 gap-4">
                      {poll.responses.map((r: any) => (
                        <div
                          key={r._id}
                          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                        >
                          <p className="text-slate-800 text-lg mb-4">
                            {r.answer}
                          </p>
                          <div className="flex items-center gap-3">
                            {["👍", "❤️", "😂", "💡"].map((emoji) => {
                              const count = r.reactions
                                ? r.reactions[emoji] || 0
                                : 0;
                              return (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    handleReact(poll._id, r._id, emoji)
                                  }
                                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-sm font-medium transition"
                                >
                                  <span className="text-xl">{emoji}</span>
                                  {count > 0 && (
                                    <span className="font-bold text-slate-700">
                                      {count}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    {isParticipant && poll.isActive && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.target as HTMLFormElement;
                          const answer = (
                            input.elements.namedItem(
                              "answer",
                            ) as HTMLInputElement
                          ).value;
                          if (answer) {
                            handlePollResponse(poll._id, answer);
                            input.reset();
                          }
                        }}
                        className="flex flex-col gap-3 mt-6"
                      >
                        <textarea
                          name="answer"
                          placeholder="Type your response..."
                          className="w-full px-5 py-4 border border-slate-300 rounded-xl text-lg bg-white"
                          rows={3}
                        />
                        <button
                          type="submit"
                          className="self-end px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
                        >
                          Submit Response
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ))}
            {event.polls.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <p className="text-slate-600 text-lg">No polls yet</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <MessageSquare size={24} />
                  Q&A
                </h2>
                {!isParticipant && event.questions.length > 0 && (
                  <button
                    onClick={handleSummarizeQnA}
                    disabled={isSummarizing}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 text-sm font-bold rounded-lg hover:bg-purple-200 transition"
                  >
                    <Sparkles size={18} />
                    {isSummarizing ? "Summarizing..." : "AI Summarize"}
                  </button>
                )}
              </div>

              {!isParticipant && summarizedThemes.length > 0 && (
                <div className="mb-8 p-6 bg-purple-50 border border-purple-200 rounded-xl">
                  <h3 className="text-base font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Sparkles size={18} /> AI Themes Summary
                  </h3>
                  <div className="space-y-3">
                    {summarizedThemes.map((theme, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-4 rounded-lg shadow-sm border border-purple-100"
                      >
                        <p className="font-bold text-purple-800 text-base">
                          {theme.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                          {theme.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isParticipant && (
                <form onSubmit={handleSubmitQuestion} className="mb-8">
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full px-5 py-4 border border-slate-300 rounded-xl mb-4 text-lg bg-white"
                    rows={3}
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
                  >
                    Submit Question
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {event.questions
                  .filter((q) => (isParticipant ? q.isApproved : true))
                  .map((question) => (
                    <div
                      key={question._id}
                      className="p-5 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <p className="text-slate-900 mb-4 text-base">
                        {question.text}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-500 font-medium">
                            {question.isAnonymous
                              ? "Anonymous"
                              : question.author}
                          </span>
                          {!isParticipant && (
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-semibold ${question.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}
                            >
                              {question.isApproved ? "Approved" : "Pending"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-5">
                          {!isParticipant && (
                            <div className="flex gap-2">
                              {!question.isApproved && (
                                <button
                                  onClick={() =>
                                    handleModerateQuestion(question._id, true)
                                  }
                                  className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </button>
                              )}
                              {question.isApproved && (
                                <button
                                  onClick={() =>
                                    handleModerateQuestion(question._id, false)
                                  }
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                                  title="Reject"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </div>
                          )}
                          <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 font-semibold transition">
                            <ThumbsUp size={18} />
                            {question.upvotes.length}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {event.questions.filter((q) =>
                  isParticipant ? q.isApproved : true,
                ).length === 0 && (
                  <p className="text-slate-500 text-center py-8 text-base">
                    No questions yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      </div>
    );
  }


  const activePoll = activeTab === "create" ? null : event.polls.find((p: any) => p._id === activeTab);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {/* Sidebar */}
      <div className="w-[280px] bg-slate-50/50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">My interactions</h2>
          <button className="p-1 hover:bg-slate-200 rounded text-slate-500"><ChevronLeft size={16}/></button>
        </div>
        <div className="px-4 flex gap-2 mb-6">
          <button 
            onClick={() => setActiveTab("create")}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Plus size={16} /> Add
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm transition">
            <LayoutTemplate size={16} /> Templates
          </button>
        </div>
        
        <div className="px-4 mb-6">
          <h3 className="text-xs font-semibold text-slate-500 mb-2">Audience Q&A</h3>
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-start hover:border-green-500 cursor-pointer transition shadow-sm group">
             <div className="flex gap-3">
               <div className="mt-0.5"><MessageSquare className="text-slate-400" size={18} /></div>
               <span className="text-sm text-slate-500 leading-snug pr-2">Add Q&A to collect questions from your audience</span>
             </div>
             <span className="text-green-700 font-bold text-sm opacity-0 group-hover:opacity-100 transition">Add</span>
          </div>
        </div>

        <div className="px-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-500 mb-2">Polls</h3>
          {event.polls.length === 0 ? (
             <p className="text-sm text-slate-500 text-center py-8">Your interactions will appear here</p>
          ) : (
             <div className="space-y-2 pb-4">
               {event.polls.map((poll: any) => (
                  <div 
                    key={poll._id} 
                    onClick={() => setActiveTab(poll._id)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition group ${activeTab === poll._id ? 'bg-white border-slate-300 shadow-sm' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'}`}
                  >
                    <p className="font-medium text-slate-800 line-clamp-2 mb-4 leading-snug">{poll.question}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          {getPollIcon(poll.type)}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {poll.responses ? poll.responses.length : 0} votes
                        </span>
                      </div>
                      
                      {/* Action buttons appear on hover or when active */}
                      <div className={`flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-sm transition-opacity ${activeTab === poll._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition">
                          <Lock size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePoll(poll._id, !poll.isActive);
                          }} 
                          className={`p-1.5 rounded-full transition text-white ${poll.isActive ? 'bg-slate-800 hover:bg-slate-900' : 'bg-green-700 hover:bg-green-800'}`}
                        >
                          {poll.isActive ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Active Green Indicator (Left edge) */}
                    {activeTab === poll._id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-l-xl"></div>
                    )}
                  </div>
               ))}
             </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
           <div className="flex items-center gap-4">
             <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
               <ArrowLeft size={20} />
             </button>
             <h1 className="font-bold text-lg text-slate-800">{event.title}</h1>
             <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200 flex items-center gap-1">
               <Sparkles size={12}/> Upgrade
             </span>
           </div>
           <div className="flex items-center gap-6 text-sm font-semibold text-slate-600">
             <span className="flex items-center gap-1.5"><LayoutTemplate size={16} className="text-slate-400"/> {event.date || "Jul 11 - 13, 2026"}</span>
             <span className="flex items-center gap-1.5"># {event.code}</span>
             <span className="flex items-center gap-1.5"><Globe size={16} className="text-slate-400"/> Public</span>
             <div className="flex items-center gap-2 ml-2">
               <button onClick={() => setShowSharePopover(true)} className="flex items-center gap-2 px-4 py-1.5 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition">
                 <Share2 size={16} /> Share
               </button>
               <div className="flex rounded-lg overflow-hidden border border-green-700">
                 <button onClick={() => router.push(`/event/${params.id}/present`)} className="flex items-center gap-2 px-4 py-1.5 bg-green-700 text-white hover:bg-green-800 transition">
                   <Play size={16} /> Present
                 </button>
                 <div className="relative border-l border-green-800">
                   <button onClick={() => setShowMenu(!showMenu)} className="flex items-center justify-center px-2 py-1.5 bg-green-700 text-white hover:bg-green-800 transition h-full">
                     <MoreHorizontal size={16} />
                   </button>
                   {showMenu && (
                     <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                       <button onClick={() => { setShowMenu(false); handleExport(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                         <Download size={16}/> Export CSV
                       </button>
                       <button onClick={() => { setShowMenu(false); handleSyncLms(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                         <BookOpen size={16}/> Sync to LMS
                       </button>
                       <label className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                         <Upload size={16}/> Import Polls
                         <input type="file" className="hidden" accept=".xlsx, .csv" onChange={(e) => { setShowMenu(false); handleImport(e); }} />
                       </label>
                       <label className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-t border-slate-100">
                         <Users size={16}/> Upload Roster
                         <input type="file" className="hidden" accept=".xlsx, .csv" onChange={(e) => { setShowMenu(false); handleImportRoster(e); }} />
                       </label>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>
        </header>

        {/* Dynamic Content Body */}
        <div className="flex-1 overflow-hidden bg-slate-50">
           {activeTab === 'create' ? (
              <CreateInteractionView onClose={() => {}} eventId={params.id as string} onSuccess={fetchEvent} />
           ) : activePoll ? (
              <div className="h-full overflow-y-auto p-8">
                 <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-bold text-slate-900">{activePoll.question}</h3>
                      <button
                        onClick={() => handleTogglePoll(activePoll._id, !activePoll.isActive)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                          activePoll.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {activePoll.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {activePoll.options.map((option: string, idx: number) => {
                        const count = activePoll.responses.filter((r: any) => r.answer === option).length;
                        const total = activePoll.responses.length;
                        const percentage = total === 0 ? 0 : Math.round((count / total) * 100);

                        return (
                          <div key={idx} className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <span className="text-sm font-semibold inline-block text-slate-700">
                                {option} {activePoll.type === "quiz" && activePoll.correctAnswer === option && "✅"}
                              </span>
                              <span className="text-sm font-semibold inline-block text-slate-700">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-100">
                              <div
                                style={{ width: `${percentage}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                 </div>
              </div>
           ) : null}
        </div>
      </div>
      <SharePopover isOpen={showSharePopover} onClose={() => setShowSharePopover(false)} eventCode={event.code} />
    </div>
  );
}
