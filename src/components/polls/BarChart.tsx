import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: { name: string; count: number }[];
}

export default function BarChart({ data }: BarChartProps) {
  return (
    <div className="w-full h-[300px] bg-white/5 rounded-xl border border-white/10 p-4">
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-white/50">No responses yet</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data}>
            <XAxis dataKey="name" stroke="#ffffff80" />
            <YAxis stroke="#ffffff80" allowDecimals={false} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.1)'}} 
              contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: 'white'}}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
