
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SectionCardProps {
  title: string;
  description: string;
  onExplore: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, description, onExplore }) => {
  const { t } = useLanguage();
  
  return (
    <div 
      className="group relative p-6 bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm
                 transform transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20
                 flex flex-col text-center items-center cursor-pointer"
      onClick={onExplore}
    >
        <h3 className="text-xl font-bold text-violet-200 mb-2">{title}</h3>
        <p className="text-violet-300 text-sm mb-6 flex-grow">{description}</p>
        <div
            className="mt-auto px-6 py-2 bg-gradient-to-r from-violet-600/80 to-sky-500/80 text-white font-semibold rounded-full 
                       shadow-lg transition-all duration-300 group-hover:shadow-sky-500/50 group-hover:scale-105 group-hover:from-violet-600 group-hover:to-sky-500"
        >
            {t('explore')}
        </div>
    </div>
  );
};

export default SectionCard;
