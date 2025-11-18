import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { OutlierStats } from '../types';

interface DashboardProps {
  stats: OutlierStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const data = [
    { subject: 'Technical', A: stats.technical, fullMark: 100 },
    { subject: 'Vision', A: stats.vision, fullMark: 100 },
    { subject: 'Grit', A: stats.grit, fullMark: 100 },
    { subject: 'Speed', A: stats.speed, fullMark: 100 },
    { subject: 'Network', A: stats.network, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-charcoal/50 rounded-2xl border border-glass p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon to-transparent opacity-50" />
      
      <h2 className="text-neon font-mono text-sm tracking-widest mb-4 uppercase">Outlier Matrix</h2>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="User"
              dataKey="A"
              stroke="#00f0ff"
              strokeWidth={2}
              fill="#00f0ff"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full mt-4">
         <div className="text-center">
            <div className="text-xs text-gray-500 font-mono">LEVEL</div>
            <div className="text-xl font-bold text-white">{(Object.values(stats).reduce((a,b)=>a+b,0)/5).toFixed(0)}</div>
         </div>
         <div className="text-center">
            <div className="text-xs text-gray-500 font-mono">STATUS</div>
            <div className="text-xl font-bold text-white">
                {stats.speed > 80 ? 'ACCELERATED' : 'STAGNANT'}
            </div>
         </div>
         <div className="text-center">
            <div className="text-xs text-gray-500 font-mono">NEXT</div>
            <div className="text-xl font-bold text-white">BUILD</div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;