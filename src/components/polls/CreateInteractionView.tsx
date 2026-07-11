"use client";

import React, { useState } from "react";
import { Edit2, ArrowUpRight, ArrowDown, RefreshCw, 
  Sparkles, 
  X, 
  List, 
  Cloud, 
  AlignLeft, 
  ListOrdered, 
  Star, 
  Trophy,
  Plus,
  MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface CreateInteractionViewProps {
  onClose: () => void;
  eventId: string;
  onSuccess: () => void;
}

type PollType = "multiple-choice" | "word-cloud" | "open-text" | "rating" | "ranking" | "quiz" | "qna";

export default function CreateInteractionView({ onClose, eventId, onSuccess }: CreateInteractionViewProps) {
  const [view, setView] = useState<"grid" | "form">("grid");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [generatedPolls, setGeneratedPolls] = useState<any[]>([]);
  
  const [newPoll, setNewPoll] = useState({
    question: "",
    type: "multiple-choice" as PollType,
    options: ["", ""],
    correctAnswer: "",
  });

  // Inline view doesn't need isOpen check

  const handleGeneratePolls = async () => {
    if (!aiPrompt) return toast.error("Please enter a prompt for AI");
    try {
      setIsGenerating(true);
      const res = await api.post("/ai/generate-polls", { prompt: aiPrompt });
      if (res.data.polls && res.data.polls.length > 0) {
        setGeneratedPolls(res.data.polls);
        toast.success("Polls generated successfully!");
      }
    } catch (err) {
      toast.error("Failed to generate polls");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddGeneratedPoll = async (poll: any, index: number) => {
    try {
      await api.post("/polls", { ...poll, event: eventId });
      toast.success("Interaction added!");
      onSuccess();
      setGeneratedPolls(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      toast.error("Failed to add interaction");
    }
  };

  const handleAiRewrite = async () => {
    if (!newPoll.question) return toast.error("Please enter a question to rewrite");
    try {
      setIsRewriting(true);
      const res = await api.post("/ai/rewrite-question", {
        question: newPoll.question,
      });

      let newText = res.data.rewrittenQuestions;
      try {
        const parsed = JSON.parse(newText);
        if (parsed.rewrittenQuestions && parsed.rewrittenQuestions.length > 0) {
          newText = parsed.rewrittenQuestions[0];
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          newText = parsed[0];
        } else if (parsed.question) {
          newText = parsed.question;
        }
      } catch (e) {
        newText = newText.split("\n")[0].replace(/^\d+\.\s*/, "").trim();
      }
      setNewPoll({ ...newPoll, question: newText });
    } catch (err) {
      toast.error("Failed to rewrite question");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newPoll.type === "qna") {
        toast.success("Q&A feature will be available soon!");
      } else {
        await api.post("/polls", { ...newPoll, event: eventId });
      }
      onSuccess();
      onClose();
      // Reset state for next open
      setView("grid");
      setNewPoll({
        question: "",
        type: "multiple-choice",
        options: ["", ""],
        correctAnswer: "",
      });
      toast.success("Interaction created!");
    } catch (err) {
      toast.error("Failed to create interaction");
    }
  };

  const selectType = (type: PollType) => {
    setNewPoll({ ...newPoll, type, options: ["", ""], correctAnswer: "", question: "" });
    setView("form");
  };

  const pollTypes = [
    { type: "qna", label: "Audience Q&A", icon: <MessageSquare size={28} className="text-red-500" />, description: "Add Q&A to collect questions from your audience" },
    { type: "multiple-choice", label: "Multiple choice", icon: <List size={28} className="text-blue-600" /> },
    { type: "word-cloud", label: "Word cloud", icon: <Cloud size={28} className="text-purple-600" /> },
    { type: "open-text", label: "Open text", icon: <AlignLeft size={28} className="text-emerald-600" /> },
    { type: "ranking", label: "Ranking", icon: <ListOrdered size={28} className="text-pink-600" /> },
    { type: "rating", label: "Rating", icon: <Star size={28} className="text-yellow-600" /> },
    { type: "quiz", label: "Quiz", icon: <Trophy size={28} className="text-orange-600" /> },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      <div className="bg-white flex flex-col h-full mx-auto w-full max-w-6xl shadow-sm border-x border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {view === "grid" ? "Add new interaction" : "Configure Interaction"}
          </h2>
          <button 
            onClick={() => {
              if (view === "form") setView("grid");
              else onClose();
            }}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {view === "grid" && generatedPolls.length > 0 && (
             <div className="bg-[#F8F9FE] -m-8 p-8 min-h-full rounded-b-2xl">
                <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
                  <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
                    Slido <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded">AI</span>
                  </div>
                  <div className="flex items-center gap-6 text-violet-600 font-medium text-sm">
                    <button className="flex items-center gap-1 hover:underline"><Edit2 size={14}/> Edit prompt</button>
                    <button onClick={() => setGeneratedPolls([])} className="flex items-center gap-1 hover:underline">Minimize Slido AI <ArrowUpRight size={14}/></button>
                  </div>
                </div>

                <h4 className="text-center text-slate-600 mb-6 font-medium">Slido interactions tailored to your topic</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                  {generatedPolls.map((poll, idx) => {
                     const typeInfo = pollTypes.find(t => t.type === poll.type) || pollTypes[1];
                     return (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition group relative flex flex-col justify-between min-h-[140px]">
                           <h5 className="font-semibold text-slate-800 mb-6 text-lg">{poll.question}</h5>
                           <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                {typeInfo.icon} {typeInfo.label}
                              </div>
                              <div className="flex items-center gap-4">
                                <button className="text-violet-600 text-sm font-semibold hover:underline">Preview</button>
                                <button onClick={() => handleAddGeneratedPoll(poll, idx)} className="h-8 w-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center hover:bg-violet-200 transition">
                                  <Plus size={18}/>
                                </button>
                              </div>
                           </div>
                        </div>
                     );
                  })}
                </div>

                <div className="mt-8 flex justify-center">
                   <button onClick={handleGeneratePolls} disabled={isGenerating} className="flex items-center gap-2 text-violet-600 font-semibold hover:bg-violet-50 px-4 py-2 rounded-lg transition">
                     <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} /> Load more
                   </button>
                </div>

                <div className="mt-16 text-center pb-8 border-b border-slate-200/50">
                   <button onClick={() => setGeneratedPolls([])} className="text-slate-600 font-semibold hover:text-slate-800 flex items-center gap-2 mx-auto">
                     Start from scratch <ArrowDown size={16} />
                   </button>
                </div>
             </div>
          )}

          {view === "grid" && generatedPolls.length === 0 && (
            <div className="space-y-8 max-w-5xl mx-auto">
              {/* AI Banner */}
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-6 flex items-start gap-4">
                <div className="bg-white p-3 rounded-lg text-violet-600 shadow-sm">
                  <Sparkles size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-violet-900 mb-2">
                    Generate with Slido <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded ml-2">AI</span>
                  </h3>
                  <div className="flex gap-3 mt-4">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="I'm hosting a team meeting..."
                      className="flex-1 px-5 py-4 bg-white border border-violet-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition text-lg"
                    />
                    <button
                      onClick={handleGeneratePolls}
                      disabled={isGenerating || !aiPrompt}
                      className="px-6 py-4 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isGenerating ? "Generating..." : "Generate"}
                      <Sparkles size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid of Poll Types */}
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pollTypes.map((pt) => (
                    <button
                      key={pt.type}
                      onClick={() => selectType(pt.type as PollType)}
                      className="group flex flex-col items-start gap-4 p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-violet-400 hover:shadow-md transition-all"
                    >
                      <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-violet-100 group-hover:scale-110 transition-all">
                        {pt.icon}
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-slate-800">{pt.label}</span>
                        {pt.description && <p className="text-xs text-slate-500 mt-1">{pt.description}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === "form" && (
            <form onSubmit={handleCreatePoll} className="space-y-6 max-w-2xl mx-auto pb-8">
              {/* Poll Type indicator */}
              <div className="flex items-center gap-3 mb-8 p-4 bg-slate-50 rounded-xl">
                {pollTypes.find(p => p.type === newPoll.type)?.icon}
                <span className="font-semibold text-slate-700">
                  {pollTypes.find(p => p.type === newPoll.type)?.label}
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold text-slate-800">
                    Question
                  </label>
                  <button
                    type="button"
                    onClick={handleAiRewrite}
                    disabled={isRewriting || !newPoll.question}
                    className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 px-4 py-2 rounded-lg disabled:opacity-50 transition"
                  >
                    <Sparkles size={14} />
                    {isRewriting ? "Rewriting..." : "AI Rewrite"}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newPoll.question}
                  onChange={(e) =>
                    setNewPoll({ ...newPoll, question: e.target.value })
                  }
                  className="w-full px-5 py-4 border border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition text-lg"
                  placeholder="What would you like to ask?"
                />
              </div>

              {(newPoll.type === "multiple-choice" ||
                newPoll.type === "quiz" ||
                newPoll.type === "ranking") && (
                <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <label className="block text-sm font-bold text-slate-800 mb-4">
                    Options
                  </label>
                  {newPoll.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...newPoll.options];
                          newOpts[idx] = e.target.value;
                          setNewPoll({ ...newPoll, options: newOpts });
                        }}
                        className="flex-1 px-5 py-4 border border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
                        placeholder={`Option ${idx + 1}`}
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = newPoll.options.filter((_, i) => i !== idx);
                            setNewPoll({ ...newPoll, options: newOpts });
                          }}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setNewPoll({
                        ...newPoll,
                        options: [...newPoll.options, ""],
                      })
                    }
                    className="flex items-center gap-2 text-violet-600 font-semibold text-sm hover:text-violet-700 transition mt-3 p-2 hover:bg-violet-50 rounded-lg"
                  >
                    <Plus size={18} /> Add Option
                  </button>

                  {newPoll.type === "quiz" && (
                    <div className="pt-6 mt-4 border-t border-slate-300">
                      <label className="block text-sm font-bold text-slate-800 mb-3">
                        Correct Answer
                      </label>
                      <select
                        required
                        value={newPoll.correctAnswer}
                        onChange={(e) =>
                          setNewPoll({
                            ...newPoll,
                            correctAnswer: e.target.value,
                          })
                        }
                        className="w-full px-5 py-4 border border-slate-300 rounded-xl text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      >
                        <option value="">Select Correct Option</option>
                        {newPoll.options
                          .filter((opt) => opt.trim() !== "")
                          .map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className="flex-1 px-6 py-4 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition font-bold"
                >
                  Save Interaction
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
