const fs = require('fs');

let code = fs.readFileSync('src/app/event/[id]/page.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import {',
  'import { Eye, Lock, List, Cloud, AlignLeft, ListOrdered, Star, Trophy, MoreVertical, '
);

// 2. Add getPollIcon function before the component
const getPollIconFn = `
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
`;

code = code.replace('export default function EventDashboard', getPollIconFn + '\nexport default function EventDashboard');

// 3. Replace the map block
const oldMap = `{event.polls.map((poll: any) => (
                  <div 
                    key={poll._id} 
                    onClick={() => setActiveTab(poll._id)}
                    className={\`p-3 rounded-lg border cursor-pointer transition \${activeTab === poll._id ? 'bg-white border-green-500 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-200'}\`}
                  >
                    <p className="font-semibold text-sm text-slate-800 line-clamp-2">{poll.question}</p>
                  </div>
               ))}`;

const newMap = `{event.polls.map((poll: any) => (
                  <div 
                    key={poll._id} 
                    onClick={() => setActiveTab(poll._id)}
                    className={\`relative p-4 rounded-xl border cursor-pointer transition group \${activeTab === poll._id ? 'bg-white border-slate-300 shadow-sm' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'}\`}
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
                      <div className={\`flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-sm transition-opacity \${activeTab === poll._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}>
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
                          className={\`p-1.5 rounded-full transition text-white \${poll.isActive ? 'bg-slate-800 hover:bg-slate-900' : 'bg-green-700 hover:bg-green-800'}\`}
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
               ))}`;

code = code.replace(oldMap, newMap);

fs.writeFileSync('src/app/event/[id]/page.tsx', code);
console.log('Sidebar cards updated!');
