const fs = require('fs');
let code = fs.readFileSync('src/app/event/[id]/page.tsx', 'utf8');

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

code = code.replace('export default function EventPage() {', getPollIconFn + '\nexport default function EventPage() {');
fs.writeFileSync('src/app/event/[id]/page.tsx', code);
console.log('Fixed getPollIcon');
