import React from 'react';

interface InteractiveCardProps {
  title: string;
  description: string;
  imageUrl: string;
  onPlay: () => void;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ title, description, imageUrl, onPlay }) => {
  return (
    <div
      onClick={onPlay}
      className="group relative bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm 
                 flex flex-col text-center items-center overflow-hidden transition-all duration-300 
                 hover:shadow-cyan-500/20 hover:shadow-lg hover:border-cyan-400/50 cursor-pointer"
    >
      <div className="w-full aspect-video bg-gray-900 overflow-hidden relative">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow w-full">
        <h3 className="text-xl font-bold text-violet-200 mb-2">{title}</h3>
        <p className="text-violet-300 text-sm mb-6 flex-grow">{description}</p>
      </div>
    </div>
  );
};

export default InteractiveCard;