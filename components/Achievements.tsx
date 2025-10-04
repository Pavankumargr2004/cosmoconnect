import React from 'react';
import Leaderboard from './Leaderboard';

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

interface AchievementsProps {
  unlockedAchievements: string[];
  allAchievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ unlockedAchievements, allAchievements }) => {
  const userScore = unlockedAchievements.length * 10;

  return (
    <section className="flex flex-col items-center h-full justify-center p-2 sm:p-4 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-300 mb-4">
          Achievements & Leaderboard
        </h2>
        <p className="text-lg text-violet-200 max-w-3xl mx-auto">
          Celebrate your cosmic journey! See your rank and the milestones you've reached.
        </p>
      </div>

      <Leaderboard userScore={userScore} />
      
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAchievements.map(ach => {
          const isUnlocked = unlockedAchievements.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={`p-6 rounded-2xl border backdrop-blur-sm
                         flex flex-col text-center items-center transition-all duration-300
                         ${isUnlocked
                           ? 'bg-yellow-400/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                           : 'bg-black/40 border-violet-500/30 opacity-60'
                         }`}
            >
              <div className={`text-5xl mb-4 transition-transform duration-300 ${isUnlocked ? 'grayscale-0' : 'grayscale'}`}>{ach.emoji}</div>
              <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? 'text-yellow-200' : 'text-violet-200'}`}>{ach.title}</h3>
              <p className={`text-sm flex-grow ${isUnlocked ? 'text-yellow-300/80' : 'text-violet-300'}`}>{ach.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Achievements;