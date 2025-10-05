import React, { useState } from 'react';

interface InteractiveCardProps {
  title: string;
  description: string;
  imageUrl: string;
  embedUrl: string;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ title, description, imageUrl, embedUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div
      className="group relative bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm 
                 flex flex-col text-center items-center overflow-hidden transition-all duration-300 
                 hover:shadow-cyan-500/20 hover:shadow-lg hover:border-cyan-400/50"
    >
      {isPlaying ? (
        <div className="relative w-full aspect-video">
          {/* YouTube iframe */}
          <iframe
            width="100%"
            height="100%"
            src={`${embedUrl}?autoplay=1`}
            title={title}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>

          {/* Back Button */}
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-md hover:bg-black/90"
          >
            ⬅ Back
          </button>
        </div>
      ) : (
        <>
          {/* Thumbnail with Play Overlay */}
          <div
            onClick={() => setIsPlaying(true)}
            className="w-full aspect-video bg-gray-900 overflow-hidden relative cursor-pointer"
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg
                className="w-16 h-16 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
              </svg>
            </div>
          </div>

          {/* Title & Description */}
          <div className="p-6 flex flex-col flex-grow w-full">
            <h3 className="text-xl font-bold text-violet-200 mb-2">{title}</h3>
            <p className="text-violet-300 text-sm mb-6 flex-grow">{description}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default InteractiveCard;
