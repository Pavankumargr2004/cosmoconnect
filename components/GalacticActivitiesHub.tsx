import React, { useState, useEffect } from 'react';
import { getSpaceCraftInstructions, generateColoringPage } from '../services/geminiService';
import FullscreenModal from './FullscreenModal';

type Activity = 'hub' | 'crafts' | 'coloring';

const craftIdeas = [
    { title: 'Bottle Rocket', emoji: '🚀', description: 'Build a rocket that can really fly using a plastic bottle!' },
    { title: 'UFO Paper Plate', emoji: '🛸', description: 'Create a flying saucer from paper plates and craft supplies.' },
    { title: 'Planet Mobile', emoji: '🪐', description: 'Design a beautiful mobile of our solar system to hang in your room.' },
    { title: 'Cardboard Rover', emoji: '🤖', description: 'Construct your own Mars rover out of cardboard boxes and wheels.' },
    { title: 'Galaxy Jar', emoji: '🌌', description: 'Capture a swirling galaxy in a jar with cotton balls, water, and glitter.' },
    { title: 'Alien Mask', emoji: '👽', description: 'Make a fun and spooky alien mask to surprise your friends.' },
];

const CraftsSection: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedCraft, setSelectedCraft] = useState<{ title: string; emoji: string } | null>(null);
    const [instructions, setInstructions] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchInstructions = async () => {
            if (selectedCraft) {
                setIsLoading(true);
                setInstructions('');
                const result = await getSpaceCraftInstructions(selectedCraft.title);
                setInstructions(result);
                setIsLoading(false);
            }
        };
        fetchInstructions();
    }, [selectedCraft]);

    return (
        <>
            <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={onBack} className="px-4 py-2 bg-violet-600/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:bg-violet-600">
                        &larr; Back
                    </button>
                    <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
                        At-Home Space Crafts
                    </h3>
                    <div className="w-24"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {craftIdeas.map(craft => (
                        <div key={craft.title} onClick={() => setSelectedCraft(craft)} className="group relative p-6 bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 flex flex-col text-center items-center cursor-pointer">
                            <div className="text-6xl mb-4">{craft.emoji}</div>
                            <h4 className="text-xl font-bold text-violet-200 mb-2">{craft.title}</h4>
                            <p className="text-violet-300 text-sm flex-grow">{craft.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            <FullscreenModal isOpen={!!selectedCraft} onClose={() => setSelectedCraft(null)} title={selectedCraft?.title}>
                <div className="w-full h-full bg-black/50 rounded-lg p-8 overflow-y-auto text-violet-200 leading-relaxed">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-12 h-12 border-4 border-t-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin"></div>
                        </div>
                    )}
                    {!isLoading && instructions && (
                        <div className="prose prose-invert prose-p:text-violet-200 prose-li:text-violet-200 prose-headings:text-cyan-300 whitespace-pre-wrap">
                             <p>{instructions}</p>
                        </div>
                    )}
                </div>
            </FullscreenModal>
        </>
    );
};

const ColoringSection: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [theme, setTheme] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!theme.trim()) return;
        setIsLoading(true);
        setImageUrl(null);
        setError('');

        const imageBytes = await generateColoringPage(theme);
        if (imageBytes) {
            setImageUrl(`data:image/png;base64,${imageBytes}`);
        } else {
            setError("Oops! Couldn't create an image for that idea. Try another one!");
        }
        setIsLoading(false);
    };

    const downloadImage = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${theme.replace(/\s+/g, '_')}_coloring_page.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="px-4 py-2 bg-violet-600/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:bg-violet-600">
                    &larr; Back
                </button>
                 <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
                    Cosmic Coloring Pages
                </h3>
                <div className="w-24"></div>
            </div>
            <div className="max-w-xl mx-auto text-center">
                <p className="text-violet-300 mb-4">What do you want to color? Let our AI create a unique page for you!</p>
                <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row items-center gap-4">
                    <input
                        type="text"
                        value={theme}
                        onChange={e => setTheme(e.target.value)}
                        placeholder="e.g., A friendly alien on a skateboard"
                        className="w-full bg-gray-900/70 border border-violet-600 rounded-full px-4 py-3 text-white text-center placeholder-violet-400/70 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                    <button type="submit" disabled={isLoading} className="px-8 py-3 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105 disabled:opacity-50 flex-shrink-0">
                        {isLoading ? 'Creating...' : 'Generate'}
                    </button>
                </form>

                <div className="mt-8 aspect-square w-full max-w-lg mx-auto bg-gray-900/50 rounded-lg flex items-center justify-center border border-violet-700/30 overflow-hidden">
                    {isLoading && (
                         <div className="w-full h-full flex flex-col items-center justify-center text-center text-violet-300 animate-pulse">
                            <span className="text-5xl mb-2">🎨</span>
                            <p>Drawing your cosmic creation...</p>
                        </div>
                    )}
                    {error && <p className="text-red-400">{error}</p>}
                    {imageUrl && (
                        <img src={imageUrl} alt={`Coloring page of ${theme}`} className="w-full h-full object-contain bg-white" />
                    )}
                </div>
                {imageUrl && (
                    <button onClick={downloadImage} className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:shadow-emerald-500/50 hover:scale-105">
                        Download & Print
                    </button>
                )}
            </div>
        </div>
    );
};

const GalacticActivitiesHub: React.FC = () => {
    const [activity, setActivity] = useState<Activity>('hub');

    const renderContent = () => {
        switch (activity) {
            case 'crafts':
                return <CraftsSection onBack={() => setActivity('hub')} />;
            case 'coloring':
                return <ColoringSection onBack={() => setActivity('hub')} />;
            case 'hub':
            default:
                return (
                    <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-8 backdrop-blur-sm border border-violet-700/30 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
                           Galactic Activities Hub
                        </h2>
                        <p className="text-violet-200 mb-8 max-w-2xl mx-auto">
                            Get creative with at-home space crafts and AI-powered coloring pages. Choose an activity to begin!
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div onClick={() => setActivity('crafts')} className="group relative p-8 bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20 flex flex-col text-center items-center cursor-pointer">
                                <div className="text-7xl mb-4">✂️</div>
                                <h3 className="text-2xl font-bold text-violet-200">Space Crafts</h3>
                                <p className="text-violet-300 mt-2">Get simple, fun instructions for crafts you can make at home.</p>
                            </div>
                             <div onClick={() => setActivity('coloring')} className="group relative p-8 bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20 flex flex-col text-center items-center cursor-pointer">
                                <div className="text-7xl mb-4">🎨</div>
                                <h3 className="text-2xl font-bold text-violet-200">Coloring Pages</h3>
                                <p className="text-violet-300 mt-2">Create unique, printable coloring pages with the power of AI.</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-zoom-in">
            {renderContent()}
        </div>
    );
};

export default GalacticActivitiesHub;