import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import InteractiveCard from './InteractiveCard';

const interactivesData = [
  {
    title: "Solar Flare Eruption",
    description: "A solar flare is a powerful and sudden release of energy...",
    imageUrl: "/assets/solar_video.jpg",
    embedUrl: "https://www.youtube.com/embed/KrPUyTNr3gs"
  },
  {
    title: "Auroras Crazy",
    description: "An aurora is a natural light display in the sky...",
    imageUrl: "/assets/Aurora.jpg",
    embedUrl: "https://www.youtube.com/embed/LcNg50PTNL4"
  },
  {
    title: "Surviving Space Weather",
    description: "As an astronaut in space, solar flares pose a serious threat...",
    imageUrl: "/assets/Astronaut.jpg",
    embedUrl: "https://www.youtube.com/embed/wfJp--kKvZo"
  },
  {
    title: "Navigating Solar Storms",
    description: "Strong solar storms force me to make critical adjustments...",
    imageUrl: "/assets/piolet_perspective.jpg",
    embedUrl: "https://www.youtube.com/embed/tdIgb0MuamU"
  },
  {
    title: "When the Sun Disrupts the Fields",
    description: "On the ground, solar flares reach into my fields...",
    imageUrl: "/assets/Farmer.png",
    embedUrl: "https://www.youtube.com/embed/eNtAP0S7mhU"
  },
  {
    title: "Chasing Auroras",
    description: "For me, solar flares are a gift. When their energy collides...",
    imageUrl: "/assets/photographer.png",
    embedUrl: "https://www.youtube.com/embed/ittCdhDQF_M"
  },
];

const InteractivesPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8 animate-zoom-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          {t('interactivesTitle')}
        </h1>
        <p className="text-lg text-violet-200 max-w-2xl mx-auto mt-4">
          {t('interactivesDesc')}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {interactivesData.map((item, index) => (
          <InteractiveCard
            key={index}
            title={item.title}
            description={item.description}
            imageUrl={item.imageUrl}
            embedUrl={item.embedUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default InteractivesPage;
