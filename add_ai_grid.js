const fs = require('fs');

let code = fs.readFileSync('src/components/polls/CreateInteractionView.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import {',
  'import { Edit2, ArrowUpRight, ArrowDown, RefreshCw,'
);

// 2. Add state
code = code.replace(
  'const [isRewriting, setIsRewriting] = useState(false);',
  'const [isRewriting, setIsRewriting] = useState(false);\n  const [generatedPolls, setGeneratedPolls] = useState<any[]>([]);'
);

// 3. Update handleGeneratePolls
const oldHandleGeneratePolls = `  const handleGeneratePolls = async () => {
    if (!aiPrompt) return toast.error("Please enter a prompt for AI");
    try {
      setIsGenerating(true);
      const res = await api.post("/ai/generate-polls", { prompt: aiPrompt });
      if (res.data.polls && res.data.polls.length > 0) {
        for (const poll of res.data.polls) {
          await api.post("/polls", { ...poll, event: eventId });
        }
        onSuccess();
        onClose();
        setAiPrompt("");
        toast.success("Polls generated successfully!");
      }
    } catch (err) {
      toast.error("Failed to generate polls");
    } finally {
      setIsGenerating(false);
    }
  };`;

const newHandleGeneratePolls = `  const handleGeneratePolls = async () => {
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
  };`;

code = code.replace(oldHandleGeneratePolls, newHandleGeneratePolls);

// 4. Update the View Grid
const oldGridStart = `{view === "grid" && (
            <div className="space-y-8">`;

const newGridUI = `{view === "grid" && generatedPolls.length > 0 && (
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
            <div className="space-y-8 max-w-5xl mx-auto">`;

code = code.replace(oldGridStart, newGridUI);

fs.writeFileSync('src/components/polls/CreateInteractionView.tsx', code);
console.log('AI Grid implemented');
