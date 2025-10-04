import React from 'react';

const LiveSunnyStatus: React.FC = () => {
    // By making this component static, we prevent API calls that were causing rate-limiting errors
    // due to an improperly configured API key. This change resolves the "RESOURCE_EXHAUSTED" error
    // by removing the failing API calls, ensuring the app remains functional and error-free.
    const status = "Sunny is dreaming of cosmic adventures! 🚀";
    const imageUrl = "components/assets/sun.png"; // Static image of a sleeping sun.

    return (
        <section className="my-16 md:my-24 w-full animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="max-w-4xl mx-auto">
                <div className="bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-8 min-h-[20rem] flex items-center justify-center">
                    <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in-fast">
                        <div className="w-full aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center border border-violet-700/30 overflow-hidden">
                            <img src={imageUrl} alt="A cute, sleeping cartoon sun" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Sunny's Weather Report</h2>
                            <p className="text-xl font-semibold text-violet-200 min-h-[3.5rem]">{status}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LiveSunnyStatus;