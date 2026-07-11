import React from 'react';

interface WordCloudProps {
  words: { text: string; value: number }[];
}

export default function WordCloud({ words }: WordCloudProps) {
  // Simple CSS-based Word Cloud
  const maxVal = Math.max(...words.map(w => w.value), 1);
  const minVal = Math.min(...words.map(w => w.value), 1);

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 p-8 bg-white/5 rounded-xl border border-white/10 min-h-[300px]">
      {words.length === 0 && <p className="text-white/50">No responses yet</p>}
      {words.map((w, i) => {
        // Calculate font size between 1rem and 4rem
        const ratio = maxVal === minVal ? 0.5 : (w.value - minVal) / (maxVal - minVal);
        const fontSize = 1 + ratio * 3;
        const opacity = 0.5 + ratio * 0.5;
        
        return (
          <span 
            key={i} 
            className="font-bold text-blue-400 transition-all duration-500 ease-in-out"
            style={{ fontSize: `${fontSize}rem`, opacity }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
}
