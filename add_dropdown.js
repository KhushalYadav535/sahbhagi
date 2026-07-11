const fs = require('fs');
let code = fs.readFileSync('src/app/event/[id]/page.tsx', 'utf8');

// Add MoreHorizontal import
code = code.replace(
  'import { useState, useEffect } from "react";',
  'import { useState, useEffect } from "react";\nimport { MoreHorizontal } from "lucide-react";'
);

// Add state
code = code.replace(
  'const [aiInsight, setAiInsight] = useState<string | null>(null);',
  'const [aiInsight, setAiInsight] = useState<string | null>(null);\n  const [showMenu, setShowMenu] = useState(false);'
);

// Replace button container
const oldButtons = `<button onClick={() => router.push(\`/event/\${params.id}/present\`)} className="flex items-center gap-2 px-4 py-1.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition">
                 <Play size={16} /> Present
               </button>`;

const newButtons = `<div className="flex rounded-lg overflow-hidden border border-green-700">
                 <button onClick={() => router.push(\`/event/\${params.id}/present\`)} className="flex items-center gap-2 px-4 py-1.5 bg-green-700 text-white hover:bg-green-800 transition">
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
               </div>`;

code = code.replace(oldButtons, newButtons);
fs.writeFileSync('src/app/event/[id]/page.tsx', code);
console.log('Done dropdown');
