import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PerspectiveCharacter } from '../types';
import { getPerspective } from '../services/geminiService';

interface PerspectivesProps {
    addAchievement: (id: string) => void;
}

const characterImageUrls: Record<PerspectiveCharacter, string> = {
    [PerspectiveCharacter.Astronaut]: 'components/assets/Astronaut.jpg',
    [PerspectiveCharacter.Pilot]: 'components/assets/piolet_perspective.jpg',
    [PerspectiveCharacter.Farmer]: 'components/assets/Farmer.png',
    [PerspectiveCharacter.Photographer]: 'components/assets/photographer.png'
};

const CharacterCard: React.FC<{ character: PerspectiveCharacter; onSelect: (char: PerspectiveCharacter) => void; isSelected: boolean }> = ({ character, onSelect, isSelected }) => {
  const icons: Record<PerspectiveCharacter, string> = {
    [PerspectiveCharacter.Astronaut]: '👩‍🚀',
    [PerspectiveCharacter.Pilot]: '👨‍✈️',
    [PerspectiveCharacter.Farmer]: '👩‍🌾',
    [PerspectiveCharacter.Photographer]: '📸',
  };

  return (
    <button
      onClick={() => onSelect(character)}
      className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-300 w-28 h-28 justify-center
        ${isSelected ? 'bg-violet-600 shadow-violet-500/50 shadow-lg transform -translate-y-2' : 'bg-violet-900/40 hover:bg-violet-800/60'}`}
    >
      <span className="text-4xl">{icons[character]}</span>
      <span className="font-semibold">{character}</span>
    </button>
  );
};

const Perspectives: React.FC<PerspectivesProps> = ({ addAchievement }) => {
  const [selectedChar, setSelectedChar] = useState<PerspectiveCharacter | null>(null);
  const [perspectiveText, setPerspectiveText] = useState<string>("Choose a friend to see them and hear their story!");
  const [isLoadingText, setIsLoadingText] = useState<boolean>(false);
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const viewedChars = useRef(new Set<PerspectiveCharacter>());

  const handleSelectCharacter = useCallback(async (character: PerspectiveCharacter) => {
    if (selectedChar === character) return;
    
    setSelectedChar(character);
    
    setIsLoadingText(true);
    setPerspectiveText(`Talking to the ${character}...`);
    setCharacterImage(characterImageUrls[character]);
    
    viewedChars.current.add(character);
    if (viewedChars.current.size === Object.values(PerspectiveCharacter).length) {
        addAchievement('stellar-interviewer');
    }

    try {
      const text = await getPerspective(character);
      setPerspectiveText(text);
    } catch (error) {
      console.error(`Error fetching data for ${character}:`, error);
      setPerspectiveText(`The ${character} is busy right now. Try again later!`);
    } finally {
      setIsLoadingText(false);
    }
  }, [selectedChar, addAchievement]);

  return (
    <section className="flex flex-col items-center h-full justify-center">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 sr-only">Friends of Sunny</h2>
      <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {(Object.values(PerspectiveCharacter)).map(char => (
            <CharacterCard key={char} character={char} onSelect={handleSelectCharacter} isSelected={selectedChar === char} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-6 min-h-[16rem]">
            <div className="order-2 md:order-1 bg-gray-900/50 p-6 rounded-lg min-h-[10rem] h-full flex items-center justify-center text-center text-violet-200 text-lg transition-colors duration-300">
              {isLoadingText ? <span className="animate-pulse">{perspectiveText}</span> : <p className="animate-fade-in">{perspectiveText}</p>}
            </div>
             <div className="order-1 md:order-2 h-64 md:h-full bg-gray-900/50 rounded-lg overflow-hidden flex items-center justify-center">
                {characterImage ? (
                    <img 
                        src={characterImage} 
                        alt={selectedChar || ''} 
                        key={selectedChar} 
                        className="w-full h-full object-cover animate-fade-in-fast"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-violet-400 text-4xl">✨</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </section>
  );
};

export default Perspectives;