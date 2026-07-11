const fs = require('fs');

let code = fs.readFileSync('src/app/event/[id]/page.tsx', 'utf8');
const oldJSX = fs.readFileSync('original_return.txt', 'utf8');

const newJSX = `
  if (isParticipant) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
${oldJSX.split('\n').slice(1).join('\n')}
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
                    className={\`p-3 rounded-lg border cursor-pointer transition \${activeTab === poll._id ? 'bg-white border-green-500 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-200'}\`}
                  >
                    <p className="font-semibold text-sm text-slate-800 line-clamp-2">{poll.question}</p>
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
             <span className="flex items-center gap-1.5"><LayoutTemplate size={16} className="text-slate-400"/> {new Date(event.createdAt).toLocaleDateString()}</span>
             <span className="flex items-center gap-1.5"># {event.code}</span>
             <span className="flex items-center gap-1.5"><Globe size={16} className="text-slate-400"/> Public</span>
             <div className="flex items-center gap-2 ml-2">
               <button onClick={() => setShowSharePopover(true)} className="flex items-center gap-2 px-4 py-1.5 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition">
                 <Share2 size={16} /> Share
               </button>
               <button onClick={() => router.push(\`/event/\${params.id}/present\`)} className="flex items-center gap-2 px-4 py-1.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition">
                 <Play size={16} /> Present
               </button>
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
                        className={\`px-4 py-1.5 rounded-full text-sm font-semibold \${
                          activePoll.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                        }\`}
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
                                style={{ width: \`\${percentage}%\` }}
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
`;

const lines = code.split('\n');
let startIndex = -1;
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('return (')) {
    startIndex = i;
    break;
  }
}

const beforeReturn = lines.slice(0, startIndex).join('\n');
const newCode = beforeReturn + '\n' + newJSX;

fs.writeFileSync('src/app/event/[id]/page.tsx', newCode);
console.log('Done!');
