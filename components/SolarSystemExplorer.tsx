import React, { useState, useEffect } from 'react';
// Fix: Import types.ts to make A-Frame custom element types available to JSX.
import '../types';
import { getPlanetFact } from '../services/geminiService';

const planets = [
  { name: 'Mercury', color: '#A9A9A9', radius: 0.38, distance: 4, speed: 10, rotationSpeed: 20 },
  { name: 'Venus', color: '#FFA500', radius: 0.95, distance: 6, speed: 15, rotationSpeed: 30 },
  { name: 'Earth', color: '#4682B4', radius: 1, distance: 8, speed: 20, rotationSpeed: 15 },
  { name: 'Mars', color: '#FF4500', radius: 0.53, distance: 10, speed: 25, rotationSpeed: 16 },
  { name: 'Jupiter', color: '#D2B48C', radius: 2.5, distance: 14, speed: 40, rotationSpeed: 8 },
  { name: 'Saturn', color: '#F0E68C', radius: 2, distance: 18, speed: 50, hasRings: true, rotationSpeed: 9 },
];

type Planet = typeof planets[number];

const SolarSystemExplorer: React.FC = () => {
    const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
    const [fact, setFact] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchFact = async () => {
            if (selectedPlanet) {
                setIsLoading(true);
                setFact('');
                try {
                    const newFact = await getPlanetFact(selectedPlanet.name);
                    setFact(newFact);
                } catch (error) {
                    setFact(`Could not fetch a fact for ${selectedPlanet.name}. It's still a mysterious world!`);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchFact();
    }, [selectedPlanet]);

    const handlePlanetClick = (planet: Planet) => {
        setSelectedPlanet(planet);
    };

    const handleBack = () => {
        setSelectedPlanet(null);
        setFact('');
    };

    return (
        <section className="flex flex-col items-center h-full justify-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 sr-only">Explore Our Solar System</h2>
            <div className="w-full h-[80vh] bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-2 sm:p-4 backdrop-blur-sm border border-violet-700/30 relative">
                <a-scene embedded renderer="colorManagement: true;" vr-mode-ui="enabled: false" key={selectedPlanet ? selectedPlanet.name : 'overview'}>
                    <a-assets>
                        <img id="sky" src="https://cdn.glitch.global/e843c0c0-15a2-439c-9c3f-4a699bce8042/2k_stars_milky_way.jpg?v=1716336306767" alt="milky way sky"/>
                        <audio id="chime-sound" src="https://cdn.glitch.global/e843c0c0-15a2-439c-9c3f-4a699bce8042/magic-chime.mp3?v=1716334543143" preload="auto"></audio>
                    </a-assets>

                    <a-sky src="#sky" parallax-sky="factor: 0.1"></a-sky>
                    <a-light type="ambient" intensity="0.3"></a-light>
                    
                    {selectedPlanet ? (
                        <>
                            <a-camera position="0 0 8" />
                            <a-light type="point" intensity="1.5" position="0 5 5"></a-light>
                            <a-entity position="0 0 0">
                                <a-sphere radius="2" color={selectedPlanet.color}>
                                    <a-animation attribute="rotation" to="0 360 0" dur={selectedPlanet.rotationSpeed * 1000} easing="linear" repeat="indefinite"></a-animation>
                                </a-sphere>
                                {selectedPlanet.hasRings && (
                                    <a-torus color="#B0A08C" segments-tubular="50" radius="3.6" radius-tubular="0.2" rotation="90 0 0" scale="1 1 0.05"></a-torus>
                                )}
                                {/* Glow effect for selected planet */}
                                <a-sphere
                                    radius="2.2"
                                    material="shader: flat; color: #67e8f9; transparent: true; opacity: 0.3; blending: additive; side: back"
                                >
                                    <a-animation
                                        attribute="scale"
                                        from="1 1 1"
                                        to="1.05 1.05 1.05"
                                        dur="2000"
                                        direction="alternate"
                                        repeat="indefinite"
                                        easing="easeInOutSine"
                                    ></a-animation>
                                </a-sphere>
                            </a-entity>
                        </>
                    ) : (
                        <>
                            <a-camera position="0 10 25" rotation="-20 0 0" cursor="rayOrigin: mouse;" look-controls="enabled: true; magicWindowTrackingEnabled: false; touchEnabled: true; mouseEnabled: true"></a-camera>
                            <a-light type="point" intensity="2" position="0 0 0"></a-light>
                            <a-sphere position="0 0 0" radius="2" color="#FFD700" material="emissive: #FFD700; emissiveIntensity: 1; shader: flat;">
                                <a-animation attribute="rotation" to="0 360 0" dur="30000" easing="linear" repeat="indefinite"></a-animation>
                            </a-sphere>

                            {planets.map(planet => (
                                <a-entity key={planet.name} rotation="0 0 0">
                                    <a-animation attribute="rotation" to="0 360 0" dur={planet.speed * 1000} easing="linear" repeat="indefinite"></a-animation>
                                    <a-entity position={`${planet.distance} 0 0`}
                                        onClick={() => handlePlanetClick(planet)}
                                        click-handler
                                        sparkle-burst
                                        sound="src: #chime-sound; on: tap;"
                                    >
                                        <a-sphere radius={planet.radius * 0.5} color={planet.color}>
                                            <a-animation attribute="rotation" to="0 360 0" dur={planet.rotationSpeed * 1000} easing="linear" repeat="indefinite"></a-animation>
                                        </a-sphere>
                                        {/* Pulsing halo to indicate interactivity */}
                                        <a-sphere
                                            radius={planet.radius * 0.5 + 0.1}
                                            material="shader: flat; color: #FFFFFF; transparent: true; opacity: 0.2; side: back;"
                                        >
                                            <a-animation
                                                attribute="scale"
                                                from="1 1 1"
                                                to="1.2 1.2 1.2"
                                                dur="1500"
                                                direction="alternate"
                                                easing="easeInOutSine"
                                                repeat="indefinite"
                                            ></a-animation>
                                            <a-animation
                                                attribute="material.opacity"
                                                from="0.1"
                                                to="0.3"
                                                dur="1500"
                                                direction="alternate"
                                                easing="easeInOutSine"
                                                repeat="indefinite"
                                            ></a-animation>
                                        </a-sphere>
                                        {planet.hasRings && (
                                            <a-torus color="#B0A08C" segments-tubular="50" radius={planet.radius * 0.5 + 0.3} radius-tubular="0.05" rotation="90 0 0"></a-torus>
                                        )}
                                        <a-text value={planet.name} position={`0 ${planet.radius * 0.5 + 0.5} 0`} align="center" color="white" width="6"></a-text>
                                    </a-entity>
                                </a-entity>
                            ))}
                        </>
                    )}
                </a-scene>

                {/* UI Overlay */}
                <div className="absolute top-4 left-4 right-4 text-center pointer-events-none">
                     <h3 className="text-xl font-bold text-sky-300">{selectedPlanet ? selectedPlanet.name : 'Interactive Solar System'}</h3>
                     <p className="text-violet-300">{selectedPlanet ? 'Here is a closer look!' : 'Click and drag to look around. Click a planet to learn more!'}</p>
                </div>

                {(selectedPlanet || isLoading) && (
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/60 backdrop-blur-md rounded-lg border border-violet-500/50 pointer-events-auto animate-fade-in">
                        <button onClick={handleBack} className="absolute top-2 right-2 text-2xl z-10">&times;</button>
                        {selectedPlanet && <h4 className="text-lg font-bold text-yellow-300">{selectedPlanet.name}</h4>}
                        <div className="min-h-[3rem] text-violet-200">
                            {isLoading && <p className="animate-pulse">Fetching cosmic secrets...</p>}
                            {fact && <p>{fact}</p>}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SolarSystemExplorer;