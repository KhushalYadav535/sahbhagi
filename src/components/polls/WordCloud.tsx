import React from 'react';

interface WordCloudProps {
  words: { text: string; value: number }[];
}

export default function WordCloud({ words }: WordCloudProps) {
  // Simple CSS-based Word Cloud
  const maxVal = Math.max(...words.map(w => w.value), 1);
  const minVal = Math.min(...words.map(w => w.value), 1);

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 p-8 min-h-[300px]">
      {words.length === 0 && <p className="text-slate-400 text-xl">No responses yet</p>}
      {words.map((w, i) => {
        // Calculate font size between 1.5rem and 4rem
        const ratio = maxVal === minVal ? 0.5 : (w.value - minVal) / (maxVal - minVal);
        const fontSize = 1.5 + ratio * 2.5;
        
        // Pick random colors for word cloud effect
        const colors = [
          'bg-blue-100 text-blue-800 border-blue-200',
          'bg-emerald-100 text-emerald-800 border-emerald-200',
          'bg-purple-100 text-purple-800 border-purple-200',
          'bg-rose-100 text-rose-800 border-rose-200',
          'bg-amber-100 text-amber-800 border-amber-200'
        ];
        const colorClass = colors[i % colors.length];

        return (
          <div 
            key={i} 
            className={`font-bold transition-all duration-500 ease-in-out flex items-center gap-3 rounded-full border shadow-sm hover:scale-105 ${colorClass}`}
            style={{ 
              fontSize: `${fontSize}rem`,
              padding: '0.2em 0.5em'
            }}
          >
            <span>{w.text}</span>
            <span 
              className="bg-black/10 text-black/70 rounded-full flex items-center justify-center font-black shadow-inner" 
              style={{ fontSize: '0.4em', padding: '0.2em 0.6em' }}
            >
              {w.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
