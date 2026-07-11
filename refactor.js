const fs = require('fs');
let code = fs.readFileSync('src/app/event/[id]/page.tsx', 'utf8');

// Add import
code = code.replace('import { useTranslation } from "react-i18next";', 'import { useTranslation } from "react-i18next";\nimport CreateInteractionModal from "@/components/polls/CreateInteractionModal";');

// Remove states
code = code.replace(/const \[newPoll.*?\n    correctAnswer: "",\n  \}\);\n/s, '');
code = code.replace(/const \[showAiModal.*\n/, '');
code = code.replace(/const \[aiPrompt.*\n/, '');
code = code.replace(/const \[isGenerating.*\n/, '');
code = code.replace(/const \[isRewriting.*\n/, '');

// Remove functions
code = code.replace(/  const handleCreatePoll = async \(e: React\.FormEvent\) => \{[\s\S]*?    \}\n  \};\n\n/, '');
code = code.replace(/  const handleGeneratePolls = async \(\) => \{[\s\S]*?    \}\n  \};\n\n/, '');
code = code.replace(/  const handleAiRewrite = async \(\) => \{[\s\S]*?    \}\n  \};\n\n/, '');

// Fix buttons - The exact string for AI Generate button
// we'll just replace setShowAiModal with setShowCreatePoll globally for ease
code = code.replace(/setShowAiModal\(true\)/g, 'setShowCreatePoll(true)');
code = code.replace(/setShowAiModal\(false\)/g, 'setShowCreatePoll(false)');

// Replace JSX blocks
const createPollRegex = /      \{showCreatePoll && \([\s\S]*?      \}\)\n/s;
code = code.replace(createPollRegex, '      <CreateInteractionModal isOpen={showCreatePoll} onClose={() => setShowCreatePoll(false)} eventId={params.id as string} onSuccess={fetchEvent} />\n');

const aiModalRegex = /      \{showAiModal && \([\s\S]*?      \}\)\n/s;
code = code.replace(aiModalRegex, '');

fs.writeFileSync('src/app/event/[id]/page.tsx', code);
console.log('Done');
