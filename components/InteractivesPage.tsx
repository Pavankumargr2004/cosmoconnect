import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import InteractiveCard from './InteractiveCard';
import FullscreenModal from './FullscreenModal';

const interactivesData = [
    {
        title: "Solar Flare Eruption",
        description: "A solar flare is a powerful and sudden release of energy that occurs on the surface of the Sun. It happens when the Sun’s magnetic field lines become twisted and tangled, then suddenly snap and reconnect in a process known as magnetic reconnection.",
        imageUrl: "components/assets/solar_video.jpg",
        videoUrl: "components/assets/Solar_flares.mp4"
    },
    {
        title: "Auroras Crazy",
        description: "An aurora is a natural light display in the sky, appearing as colorful dancing curtains of light, created when charged particles from the Sun collide with gases in Earth's atmosphere near the poles",
        imageUrl: "components/assets/Aurora.jpg",
        videoUrl: "components/assets/Auroras.mp4"
    },
    {
        title: "Surviving Space Weather",
        description: "As an astronaut in space, solar flares pose a serious threat to my health and safety. These powerful eruptions from the Sun release intense radiation in the form of X-rays, gamma rays, and energetic particles that can penetrate spacecraft walls.",
        imageUrl: "components/assets/Astronaut.jpg",
        videoUrl: "components/assets/astronaut.mp4"
    },
    {
        title: "Navigating Solar Storms",
        description: "Strong solar storms force me to make critical adjustments to flight paths. The high-energy particles released during these storms can increase radiation levels at high altitudes, putting both crew and passengers at risk.",
        imageUrl: "components/assets/piolet_perspective.jpg",
        videoUrl: "components/assets/poilet.mp4"
    },
    {
        title: "When the Sun Disrupts the Fields",
        description: "On the ground, solar flares reach into my fields in ways most people never imagine. My modern tractors use GPS for precision farming — guiding straight rows, controlling seeding depth, and optimizing harvesting",
        imageUrl: "components/assets/Farmer.png",
        videoUrl: "components/assets/Farmer.mp4"
    },
    {
        title: "Chasing Auroras",
        description: "For me, solar flares are a gift. When their energy collides with Earth’s magnetic field, the result is breathtaking auroras that light up the sky in waves of green, purple, and red. I chase these natural light shows across remote landscapes, camera in hand, waiting for the skies to explode with color.",
        imageUrl: "components/assets/photographer.png",
        videoUrl: "components/assets/photographer.mp4"
    },
];

const InteractivesPage: React.FC = () => {
    const { t } = useLanguage();
    const [selectedVideo, setSelectedVideo] = useState<{ title: string; url: string; poster: string; } | null>(null);

    return (
        <>
            <div className="container mx-auto px-4 py-8 animate-zoom-in">
                 <div className="text-center mb-12">
                    <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                        {t('interactivesTitle')}
                    </h1>
                    <p className="text-lg text-violet-200 max-w-2xl mx-auto mt-4">
                        {t('interactivesDesc')}
                    </p>
                </div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {interactivesData.map((item, index) => (
                        <InteractiveCard
                            key={index}
                            title={item.title}
                            description={item.description}
                            imageUrl={item.imageUrl}
                            onPlay={() => setSelectedVideo({ title: item.title, url: item.videoUrl, poster: item.imageUrl })}
                        />
                    ))}
                </div>
            </div>
             <FullscreenModal
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
                title={selectedVideo?.title}
            >
                {selectedVideo && (
                    <video
                        src={selectedVideo.url}
                        poster={selectedVideo.poster}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain bg-black rounded-lg"
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </FullscreenModal>
        </>
    );
};

export default InteractivesPage;