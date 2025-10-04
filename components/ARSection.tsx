import React, { useState } from 'react';
import ARMode from './ARMode';

const ARSection: React.FC = () => {
    const [isArActive, setIsArActive] = useState(false);

    const handleLaunchAR = () => {
        // Fix for Error: Property 'xr' does not exist on type 'Navigator'.
        if ((navigator as any).xr) {
            setIsArActive(true);
        } else {
            alert("Sorry, your browser doesn't support the AR experience!");
        }
    };

    return (
        <section id="ar-mode" className="flex flex-col items-center scroll-mt-28">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Enter Sunny's World</h2>
            <div className="w-full max-w-4xl bg-violet-900/20 rounded-2xl shadow-2xl shadow-violet-500/10 p-6 sm:p-8 backdrop-blur-sm border border-violet-700/30 text-center">
                <div className="text-5xl mb-4">📸</div>
                <h3 className="text-2xl font-bold text-violet-200 mb-2">AR & Animation Mode</h3>
                <p className="text-violet-300 mb-6 max-w-xl mx-auto">
                    Point your camera and watch Sunny pop out right in your room! See magical auroras fill the space around you for a truly immersive adventure.
                </p>
                <button
                    onClick={handleLaunchAR}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-full shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                    ✨ Launch AR Adventure
                </button>
            </div>
            {isArActive && <ARMode onClose={() => setIsArActive(false)} />}
        </section>
    );
};

export default ARSection;