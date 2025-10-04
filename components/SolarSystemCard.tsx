import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../types'; // For A-Frame types

interface SolarSystemCardProps {
  title: string;
  description: string;
  onExplore: () => void;
}

const SolarSystemCard: React.FC<SolarSystemCardProps> = ({ title, description, onExplore }) => {
  const { t } = useLanguage();
  
  return (
    <div 
      className="group relative bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm
                 transform transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20
                 flex flex-col text-center items-center cursor-pointer overflow-hidden"
      onClick={onExplore}
    >
      <div className="w-full h-32">
        <a-scene embedded renderer="colorManagement: true; alpha: true;" vr-mode-ui="enabled: false" style={{ backgroundColor: 'transparent' }}>
            <a-sphere position="0 0 -2.5" radius="0.8" color="#FF4500">
                <a-animation attribute="rotation" to="0 360 0" dur="10000" easing="linear" repeat="indefinite"></a-animation>
            </a-sphere>
            <a-light type="ambient" intensity="0.5"></a-light>
            <a-light type="point" intensity="1" position="2 2 2"></a-light>
        </a-scene>
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

export default SolarSystemCard;
