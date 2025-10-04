import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

// Simple mock data for the preview chart
const mockData = [
  { name: 'Day 1', speed: 400 },
  { name: 'Day 2', speed: 600 },
  { name: 'Day 3', speed: 550 },
  { name: 'Day 4', speed: 800 },
  { name: 'Day 5', speed: 750 },
  { name: 'Day 6', speed: 900 },
  { name: 'Day 7', speed: 850 },
];

interface CMEAnalysisCardProps {
  title: string;
  description: string;
  onExplore: () => void;
}

const CMEAnalysisCard: React.FC<CMEAnalysisCardProps> = ({ title, description, onExplore }) => {
  const { t } = useLanguage();

  return (
    <div
      className="group relative bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm
                 transform transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20
                 flex flex-col text-center items-center cursor-pointer overflow-hidden"
      onClick={onExplore}
    >
      <div className="w-full h-32 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#67e8f9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 42, 0.8)',
                border: '1px solid #67e8f9',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#a78bfa' }}
              itemStyle={{ color: '#67e8f9' }}
            />
            <Area type="monotone" dataKey="speed" stroke="#67e8f9" fillOpacity={1} fill="url(#colorSpeed)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="p-6 pt-0 flex flex-col flex-grow w-full">
        <h3 className="text-xl font-bold text-violet-200 mb-2">{title}</h3>
        <p className="text-violet-300 text-sm mb-6 flex-grow">{description}</p>
        <div
            className="mt-auto px-6 py-2 bg-gradient-to-r from-violet-600/80 to-sky-500/80 text-white font-semibold rounded-full
                       shadow-lg transition-all duration-300 group-hover:shadow-sky-500/50 group-hover:scale-105 group-hover:from-violet-600 group-hover:to-sky-500"
        >
            {t('explore')}
        </div>
      </div>
    </div>
  );
};

export default CMEAnalysisCard;
