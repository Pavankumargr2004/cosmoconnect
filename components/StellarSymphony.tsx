import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import '../types';

interface StarData {
  name: string;
  temperature: number; // in Kelvin
  radius: number; // in solar radii
  luminosity: number; // relative to Sun
  distance: number; // in light years
  color: string;
  position: string;
  scale: number;
}

const starData: StarData[] = [
  { name: 'Sol', temperature: 5778, radius: 1, luminosity: 1, distance: 0, color: '#FFF2A5', position: '0 0 -5', scale: 0.8 },
  { name: 'Sirius', temperature: 9940, radius: 1.7, luminosity: 25.4, distance: 8.6, color: '#A9CFFF', position: '-4 2 -8', scale: 1.2 },
  { name: 'Betelgeuse', temperature: 3500, radius: 887, luminosity: 126000, distance: 642.5, color: '#FF7D4A', position: '5 -1 -10', scale: 2.5 },
  { name: 'Rigel', temperature: 12100, radius: 78.9, luminosity: 120000, distance: 860, color: '#99E1FF', position: '3 3 -12', scale: 1.8 },
  { name: 'Proxima Centauri', temperature: 3042, radius: 0.14, luminosity: 0.0017, distance: 4.2, color: '#FFB385', position: '-2 -2 -6', scale: 0.4 },
];

const StellarSymphony: React.FC = () => {
    const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        // Initialize the synth on component mount
        synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 1.5,
            modulationIndex: 1.2,
            envelope: { attack: 0.5, decay: 1, sustain: 0.8, release: 3 },
            modulationEnvelope: { attack: 0.1, decay: 0.5, sustain: 0.2, release: 1 },
        }).toDestination();
        
        // Add reverb for a spacious feel
        const reverb = new Tone.Reverb(4).toDestination();
        synthRef.current.connect(reverb);

        return () => {
            // Cleanup on unmount
            synthRef.current?.dispose();
        };
    }, []);

    const playStarSound = async (star: StarData) => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        
        const synth = synthRef.current;
        if (!synth) return;

        // Map star properties to musical parameters
        const baseFreq = 55; // A1
        const tempToOctave = (temp: number) => Math.log2(temp / 1000) + 1; // Map 1000K to octave 1
        const octave = tempToOctave(star.temperature);
        const fundamental = baseFreq * Math.pow(2, octave);

        // Cooler stars get minor chords, hotter stars get major chords
        const chord = star.temperature < 6000 
            ? [fundamental, fundamental * 1.189, fundamental * 1.498] // Minor chord
            : [fundamental, fundamental * 1.26, fundamental * 1.498];  // Major chord

        const volume = -20 + Math.log10(star.luminosity + 1) * 3; // Logarithmic scale for volume
        
        // Trigger a gentle chord that fades in and out
        synth.volume.value = volume;
        synth.triggerAttackRelease(chord, `${star.radius / 10 + 2}s`); // Larger stars have longer notes
        setSelectedStar(star);
    };

    return (
        <section className="flex flex-col items-center h-full justify-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 sr-only">Stellar Symphony</h2>
            <div className="w-full h-[80vh] bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-2 sm:p-4 backdrop-blur-sm border border-violet-700/30 relative">
                <a-scene embedded renderer="colorManagement: true;" vr-mode-ui="enabled: false">
                    <a-assets>
                        <img id="sky-symphony" src="https://cdn.glitch.global/e843c0c0-15a2-439c-9c3f-4a699bce8042/2k_stars_milky_way.jpg?v=1716336306767" alt="milky way"/>
                    </a-assets>

                    <a-sky src="#sky-symphony" parallax-sky="factor: 0.05"></a-sky>
                    <a-camera position="0 0 5" cursor="rayOrigin: mouse;"></a-camera>

                    {starData.map(star => (
                        <a-entity key={star.name} position={star.position} onClick={() => playStarSound(star)}>
                            <a-sphere 
                                radius={star.scale} 
                                color={star.color} 
                                material={`emissive: ${star.color}; emissiveIntensity: 1.5`}
                            >
                                <a-animation attribute="scale" from="1 1 1" to="1.1 1.1 1.1" dur="3000" direction="alternate" repeat="indefinite" easing="easeInOutSine"></a-animation>
                            </a-sphere>
                            <a-sphere 
                                radius={star.scale + 0.1} 
                                color={star.color} 
                                material="shader: flat; transparent: true; opacity: 0.2; side: back"
                            >
                                <a-animation attribute="scale" from="1 1 1" to="1.5 1.5 1.5" dur="3000" direction="alternate" repeat="indefinite" easing="easeInOutSine"></a-animation>
                                <a-animation attribute="material.opacity" from="0.1" to="0.3" dur="3000" direction="alternate" repeat="indefinite" easing="easeInOutSine"></a-animation>
                            </a-sphere>
                        </a-entity>
                    ))}
                </a-scene>

                <div className="absolute top-4 left-4 right-4 text-center pointer-events-none">
                    <h3 className="text-xl font-bold text-sky-300">Stellar Symphony</h3>
                    <p className="text-violet-300">Click on a star to hear its unique cosmic sound.</p>
                </div>

                <AnimatePresence>
                    {selectedStar && (
                        <motion.div 
                            className="absolute bottom-4 left-4 right-4 p-4 bg-black/60 backdrop-blur-md rounded-lg border border-violet-500/50 pointer-events-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <h4 className="text-lg font-bold text-yellow-300">{selectedStar.name}</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-violet-200 mt-2">
                                <p><strong>Temperature:</strong> {selectedStar.temperature.toLocaleString()} K</p>
                                <p><strong>Luminosity:</strong> {selectedStar.luminosity.toLocaleString()}x Sun</p>
                                <p><strong>Radius:</strong> {selectedStar.radius.toLocaleString()}x Sun</p>
                                <p><strong>Distance:</strong> {selectedStar.distance.toLocaleString()} light-years</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default StellarSymphony;
