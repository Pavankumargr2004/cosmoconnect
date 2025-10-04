import React, { useRef, useEffect } from 'react';

const SpaceWeatherExplainer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // This useEffect hook attempts to programmatically play the video when the component mounts.
    // This is a robust way to handle autoplay as browser policies can sometimes ignore the `autoPlay` attribute.
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                // Autoplay was prevented. This can happen if the browser's policy is very strict.
                console.error("Video autoplay was blocked by the browser:", error);
            });
        }
    }, []);

    return (
        <section className="mb-12 w-full max-w-5xl mx-auto bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-6 sm:p-8 animate-fade-in">
            <div className="text-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 mb-2">
                    What is Space Weather?
                </h2>
                <p className="text-violet-300 max-w-3xl mx-auto">
                    Ever wondered what our sun, Sunny, is up to? Watch this amazing video from NASA to see how solar flares and solar wind create beautiful auroras and affect us here on Earth!
                </p>
            </div>
            <div 
                className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-violet-700/30 shadow-2xl shadow-violet-500/20"
            >
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    poster="https://svs.gsfc.nasa.gov/vis/a010000/a014900/a014907/frames/1920x1080_16x9_60p/SpaceWeatherExplained_frame_0790.png"
                    playsInline
                    preload="auto"
                    autoPlay
                    muted
                    loop
                >
                    <source src="https://svs.gsfc.nasa.gov/vis/a010000/a014900/a014907/14907_Space_Weather_Explained_1080p60.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </section>
    );
};

export default SpaceWeatherExplainer;