import React, { useState, useEffect, useRef } from 'react';
import { getStoryStream, generateColoringPage } from '../services/geminiService';
import { Content } from '@google/genai';

interface StorybookProps {
    addAchievement: (id: string) => void;
}

const Storybook: React.FC<StorybookProps> = ({ addAchievement }) => {
  const [history, setHistory] = useState<Content[]>([]);
  const [currentStoryChunk, setCurrentStoryChunk] = useState('');
  const [choices, setChoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [choiceCount, setChoiceCount] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const choiceRegex = /\[CHOICE\s?\d:\s?(.*?)\]/g;
  
  const processStream = async (message: string) => {
    const chat = getStoryStream(history);
    
    setIsLoading(true);
    setCurrentStoryChunk('');
    setChoices([]);
    
    if (!chat) {
        setCurrentStoryChunk("The storybook is currently offline. Please try again later!");
        setIsLoading(false);
        return;
    }

    const stream = await chat.sendMessageStream({ message });
    let accumulatedText = '';
    
    for await (const chunk of stream) {
      accumulatedText += chunk.text;
      const cleanedText = accumulatedText.replace(choiceRegex, '').trim();
      setCurrentStoryChunk(cleanedText);

      const foundChoices = [...accumulatedText.matchAll(choiceRegex)].map(match => match[1]);
      if (foundChoices.length > 0) {
        setChoices(foundChoices);
      }
    }
    
    // Generate image for the story scene
    const imagePrompt = `A scene from a children's space adventure story featuring Sunny the Solar Flare: ${accumulatedText.substring(0, 100)}...`;
    try {
      const imageBytes = await generateColoringPage(imagePrompt);
      if (imageBytes) {
        setImageUrl(`data:image/png;base64,${imageBytes}`);
      }
    } catch (error) {
      console.error("Failed to generate story image:", error);
      // Keep using the static image if generation fails
    }
    
    setHistory(prev => [...prev, { role: 'user', parts: [{ text: message }] }, { role: 'model', parts: [{ text: accumulatedText }] }]);
    setIsLoading(false);
  };

  useEffect(() => {
    processStream("Let's start the story!");
  }, []);

  const handleChoice = (choiceText: string) => {
    if (isLoading) return;
    const newCount = choiceCount + 1;
    setChoiceCount(newCount);
    if (newCount >= 5) {
        addAchievement('story-explorer');
    }
    processStream(choiceText);
  };
  
  return (
    <section className="flex flex-col items-center w-full p-2 sm:p-4">
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">The Living Storybook</h2>
      <div className="w-full max-w-4xl flex flex-col bg-black/50 rounded-2xl shadow-2xl shadow-violet-500/20 backdrop-blur-sm border border-violet-700/30">
        <div className="relative w-full aspect-video flex-shrink-0">
          {imageUrl ? (
            <img 
              src={imageUrl}
              alt="Scene from the story" 
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="/assets/Solar flare.jpg"
              alt="Sunny the Solar Flare" 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>
        
        <div className="flex flex-col justify-between flex-grow p-6">
          <div className="text-violet-200 text-center text-lg sm:text-xl leading-relaxed mb-6 overflow-y-auto" style={{ maxHeight: '30vh' }}>
            {currentStoryChunk}
            {isLoading && choices.length === 0 && <span className="inline-block w-2 h-2 ml-2 bg-violet-400 rounded-full animate-pulse"></span>}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {choices.length > 0 && !isLoading ? (
              choices.map((choice, index) => (
                <button 
                  key={index}
                  onClick={() => handleChoice(choice)}
                  className="px-6 py-3 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 rounded-full transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-sky-300 font-semibold animate-fade-in flex-shrink-0 min-w-[200px]"
                >
                  {choice}
                </button>
              ))
            ) : (
                 <div className="h-[58px] flex items-center justify-center"> {/* Placeholder to prevent layout shift */}
                    {isLoading && <p className="text-center text-violet-400 animate-pulse">Sunny is thinking...</p>}
                 </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Storybook;