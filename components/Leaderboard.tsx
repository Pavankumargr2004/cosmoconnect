import React from 'react';

// Mock data for the leaderboard
const mockPlayers = [
  { name: 'CosmicRay', score: 100 },
  { name: 'StarHopper', score: 90 },
  { name: 'GalaxyGazer', score: 80 },
  { name: 'NovaKnight', score: 70 },
  { name: 'AstroAce', score: 60 },
  { name: 'RocketRider', score: 50 },
  { name: 'PlanetPioneer', score: 40 },
  { name: 'CometChaser', score: 30 },
  { name: 'MeteorMaster', score: 20 },
];

interface LeaderboardProps {
  userScore: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ userScore }) => {
  // Add the current user to the list and sort
  const playersWithUser = [...mockPlayers, { name: 'You', score: userScore }]
    .sort((a, b) => b.score - a.score);

  // Find the user's rank
  const userRank = playersWithUser.findIndex(p => p.name === 'You') + 1;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return <span className="text-violet-300 font-mono">{rank}</span>;
  };

  return (
    <div className="w-full max-w-2xl bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-6 mb-12">
      <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6">
        Cosmic Leaderboard
      </h3>
      <div className="space-y-3">
        {playersWithUser.map((player, index) => {
          const rank = index + 1;
          const isUser = player.name === 'You';
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg transition-all
                ${isUser
                  ? 'bg-sky-500/30 border border-sky-400 scale-105 shadow-lg'
                  : 'bg-gray-900/50'
                }`
              }
            >
              <div className="flex items-center gap-4">
                <div className="w-8 text-center text-xl font-bold">{getRankIcon(rank)}</div>
                <span className={`font-semibold ${isUser ? 'text-white' : 'text-violet-200'}`}>{player.name}</span>
              </div>
              <span className={`font-bold text-lg ${isUser ? 'text-sky-300' : 'text-amber-400'}`}>{player.score} pts</span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 text-center text-violet-300">
        <p>Your Rank: <strong className="text-sky-300">{userRank}</strong> | Your Score: <strong className="text-amber-400">{userScore}</strong></p>
      </div>
    </div>
  );
};

export default Leaderboard;