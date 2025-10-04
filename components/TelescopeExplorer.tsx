
import React, { useState } from 'react';
import FullscreenModal from './FullscreenModal';

interface Telescope {
    name: string;
    url: string;
}

const telescopes: Telescope[] = [
    { name: 'James Webb Space Telescope', url: 'https://eyes.nasa.gov/apps/solar-system/#/sc_jwst' },
    { name: 'Hubble Space Telescope', url: 'https://eyes.nasa.gov/apps/solar-system/#/story/hubble_25th' }
];

const TelescopeCard: React.FC<{ telescope: Telescope; onOpen: (telescope: Telescope) => void; index: number }> = ({ telescope, onOpen, index }) => (
    <div className="group cursor-pointer" onClick={() => onOpen(telescope)}>
        <h3 className={`text-xl font-bold text-center mb-3 ${index === 0 ? 'text-sky-300' : 'text-violet-300'}`}>{telescope.name}</h3>
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-900 border border-violet-700/30 relative transition-all duration-300 group-hover:border-sky-400 group-hover:shadow-lg group-hover:shadow-sky-500/20">
            <iframe
                src={telescope.url}
                title={`NASA's Eyes on the ${telescope.name}`}
                frameBorder="0"
                className="w-full h-full pointer-events-none"
                loading="lazy"
            ></iframe>
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-center text-white">
                    <svg className="w-16 h-16 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <p className="font-semibold mt-2">View Fullscreen</p>
                </div>
            </div>
        </div>
    </div>
);


const TelescopeExplorer: React.FC = () => {
    const [fullscreenTelescope, setFullscreenTelescope] = useState<Telescope | null>(null);

    return (
        <>
            <section className="flex flex-col items-center h-full justify-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 sr-only">NASA's Great Observatories</h2>
                <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
                    <p className="text-violet-300 text-center mb-6">
                        See where the James Webb and Hubble space telescopes are right now and explore their amazing journeys! Click a view to go fullscreen.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {telescopes.map((telescope, index) => (
                           <TelescopeCard key={index} telescope={telescope} onOpen={setFullscreenTelescope} index={index} />
                        ))}
                    </div>
                </div>
            </section>
            
            <FullscreenModal 
                isOpen={!!fullscreenTelescope} 
                onClose={() => setFullscreenTelescope(null)}
                title={fullscreenTelescope?.name}
            >
                {fullscreenTelescope && (
                    <iframe
                        src={fullscreenTelescope.url}
                        title={`NASA's Eyes on the ${fullscreenTelescope.name}`}
                        allowFullScreen
                        frameBorder="0"
                        className="w-full h-full rounded-lg bg-black"
                    ></iframe>
                )}
            </FullscreenModal>
        </>
    );
};

export default TelescopeExplorer;
