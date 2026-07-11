const fs = require('fs');
let code = fs.readFileSync('src/app/event/[id]/page.tsx', 'utf8');

// 1. Add Icons
code = code.replace(
  'import {',
  'import { LayoutTemplate, ChevronLeft, ChevronRight, '
);

// 2. Add State
code = code.replace(
  'const [showCreatePoll, setShowCreatePoll] = useState(false);',
  'const [activeTab, setActiveTab] = useState<string>("create");\n  const [showCreatePoll, setShowCreatePoll] = useState(false);'
);

fs.writeFileSync('src/app/event/[id]/page.tsx', code);
console.log('State added');
