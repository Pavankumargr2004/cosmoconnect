import React, { useState, useEffect } from 'react';
// Fix: Import types.ts to make A-Frame custom element types available to JSX.
import '../types';
import { getJWSTFact } from '../services/geminiService';

const hotspots = [
    { name: 'Primary Mirror', position: '0 1.2 0.5' },
    { name: 'Sunshield', position: '0 -1.5 0' },
    { name: 'Secondary Mirror', position: '0 1.5 2.5' },
    { name: 'ISIM Electronics Compartment', position: '0 0 -0.8' },
];

const JamesWebbExplorer: React.FC = () => {
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const [info, setInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchInfo = async () => {
            if (selectedPart) {
                setIsLoading(true);
                setInfo('');
                try {
                    const newInfo = await getJWSTFact(selectedPart);
                    setInfo(newInfo);
                } catch (error) {
                    setInfo(`Could not fetch info for ${selectedPart}. It's a complex piece of engineering!`);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchInfo();
    }, [selectedPart]);
    
    return (
        <section className="flex flex-col items-center h-full justify-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 sr-only">Explore James Webb in 3D</h2>
             <div className="w-full h-[80vh] bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-2 sm:p-4 backdrop-blur-sm border border-violet-700/30 relative">
                <a-scene embedded renderer="colorManagement: true;" vr-mode-ui="enabled: false">
                    <a-assets>
                        <a-asset-item id="jwst-model" src="https://cdn.glitch.global/e843c0c0-15a2-439c-9c3f-4a699bce8042/jwst.glb?v=1716335359268"></a-asset-item>
                         <img id="sky-jwst" src="https://cdn.glitch.global/e843c0c0-15a2-439c-9c3f-4a699bce8042/2k_stars_milky_way.jpg?v=1716336306767" alt="milky way"/>
                        <audio id="chime-sound-jwst" src="https://cdn.glitch.global/e843c0c0-15a2-439c-9c3f-4a699bce8042/magic-chime.mp3?v=1716334543143" preload="auto"></audio>
                    </a-assets>

                    <a-sky src="#sky-jwst"></a-sky>

                    <a-camera position="0 1 8" cursor="rayOrigin: mouse;"></a-camera>
                    <a-entity light="type: ambient; intensity: 0.5;"></a-entity>
                    <a-entity light="type: directional; intensity: 0.8;" position="-3 5 5"></a-entity>

                    <a-entity id="jwst" gltf-model="#jwst-model" position="0 0 0" scale="1.5 1.5 1.5">
                        <a-animation attribute="rotation" to="0 360 0" dur="60000" easing="linear" repeat="indefinite"></a-animation>
                        {hotspots.map(spot => (
                            <a-sphere
                                key={spot.name}
                                position={spot.position}
                                radius="0.1"
                                color="#67e8f9"
                                material="opacity: 0.6; emissive: #67e8f9; emissiveIntensity: 2;"
                                onClick={() => setSelectedPart(spot.name)}
                                click-handler
                                sound="src: #chime-sound-jwst; on: tap;"
                            >
                                <a-animation attribute="scale" from="1 1 1" to="1.2 1.2 1.2" dur="1000" direction="alternate" repeat="indefinite" easing="easeInOutSine"></a-animation>
                            </a-sphere>
                        ))}
                    </a-entity>
                </a-scene>
                
                 {/* UI Overlay */}
                <div className="absolute top-4 left-4 right-4 text-center pointer-events-none">
                    <h3 className="text-xl font-bold text-sky-300">James Webb Space Telescope</h3>
                    <p className="text-violet-300">Click on the glowing orbs to learn about each part.</p>
                </div>
                
                 {selectedPart && (
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/60 backdrop-blur-md rounded-lg border border-violet-500/50 pointer-events-auto animate-fade-in">
                        <button onClick={() => setSelectedPart(null)} className="absolute top-2 right-2 text-2xl">&times;</button>
                        <h4 className="text-lg font-bold text-cyan-300">{selectedPart}</h4>
                        <div className="min-h-[3rem] text-violet-200">
                            {isLoading && <p className="animate-pulse">Decoding cosmic blueprints...</p>}
                            {info && <p>{info}</p>}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default JamesWebbExplorer;