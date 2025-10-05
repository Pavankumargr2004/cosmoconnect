import React, { useState } from 'react';
import { getAuroraStory, generateColoringPage } from '../services/geminiService';

interface AuroraExplorerProps {
    addAchievement: (id: string) => void;
}

const AuroraExplorer: React.FC<AuroraExplorerProps> = ({ addAchievement }) => {
    const [auroraStory, setAuroraStory] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const checkAuroras = async () => {
        setIsLoading(true);
        setAuroraStory(null);
        setImageUrl(null);
        addAchievement('sky-watcher');
        
        try {
            const story = await getAuroraStory();
            setAuroraStory(story);
            
            // Generate an image of the aurora
            const imageBytes = await generateColoringPage("A beautiful aurora display with colorful lights dancing in the night sky over a landscape");
            if (imageBytes) {
                setImageUrl(`data:image/png;base64,${imageBytes}`);
            }
        } catch (error) {
            console.error("Error fetching aurora data:", error);
            setAuroraStory("The stars are shining bright, but the auroras are shy tonight.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <section className="flex flex-col items-center h-full justify-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 sr-only">Aurora Explorer</h2>
            <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-6 bg-gray-800">
                    {imageUrl ? (
                        <img src={imageUrl} alt="A beautiful aurora display" className="w-full h-full object-cover" />
                    ) : (
                        <img src="/assets/Aurora_earth.png" alt="A beautiful aurora display" className="w-full h-full object-cover" />
                    )}
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white text-center">
                                <div className="w-12 h-12 border-4 border-t-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin mx-auto mb-2"></div>
                                <p>Searching for auroras...</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <p className="text-xl text-violet-200 mb-6 min-h-[3rem]">
                        {auroraStory || "Click the button to see if there are auroras visible tonight!"}
                    </p>
                    <button 
                        onClick={checkAuroras}
                        disabled={isLoading}
                        className="px-8 py-3 bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:shadow-emerald-500/50 hover:scale-105 disabled:opacity-50"
                    >
                        {isLoading ? 'Searching...' : 'Check for Auroras'}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AuroraExplorer;