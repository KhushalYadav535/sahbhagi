import React, { useState } from 'react';

export default function RankingPollParticipant({ poll, onSubmit }: { poll: any, onSubmit: (answer: string[]) => void }) {
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);

  const handleSelect = (option: string) => {
    if (selectedOrder.includes(option)) {
      setSelectedOrder(selectedOrder.filter(o => o !== option));
    } else {
      setSelectedOrder([...selectedOrder, option]);
    }
  };

  const unselectedOptions = poll.options.filter((o: string) => !selectedOrder.includes(o));

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-2">Tap options in the order of your preference (1st, 2nd, 3rd...)</p>
      
      {selectedOrder.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="font-semibold text-gray-800 text-sm">Your Ranking:</h4>
          {selectedOrder.map((opt, idx) => (
            <div key={opt} className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
              <span className="font-bold text-blue-600 w-6">{idx + 1}.</span>
              <span className="flex-1">{opt}</span>
              <button 
                onClick={() => handleSelect(opt)}
                className="text-red-500 hover:text-red-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {unselectedOptions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800 text-sm">Options:</h4>
          {unselectedOptions.map((opt: string) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className="w-full text-left px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => onSubmit(selectedOrder)}
        disabled={selectedOrder.length !== poll.options.length}
        className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
      >
        Submit Ranking
      </button>
    </div>
  );
}
