import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';

// Mock data fetching to simulate getting real-time solar data
const fetchSolarData = async (): Promise<{ windSpeed: number; geoIndex: number }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    windSpeed: Math.random() * 500 + 300, // km/s, range 300-800
    geoIndex: Math.random() * 9,      // Kp-index, range 0-9
  };
};

// Helper to map a value from one range to another
const mapValue = (value: number, in_min: number, in_max: number, out_min: number, out_max: number): number => {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

const MusicVisualizer: React.FC<{ analyser: Tone.Analyser | null; isPlaying: boolean }> = ({ analyser, isPlaying }) => {
    const [levels, setLevels] = useState<number[]>(new Array(5).fill(1));

    useEffect(() => {
        if (!isPlaying || !analyser) {
            setLevels(new Array(5).fill(1));
            return;
        }

        let animationFrameId: number;

        const updateLevels = () => {
            const values = analyser.getValue();
            if (values instanceof Float32Array) {
                const newLevels = Array.from({ length: 5 }, (_, i) => {
                    const index = Math.floor(mapValue(i, 0, 5, 0, values.length));
                    const magnitude = Math.abs(values[index] as number);
                    return magnitude * 0.7 + 0.3; // Map magnitude 0-1 to opacity 0.3-1
                });
                setLevels(newLevels);
            }
            animationFrameId = requestAnimationFrame(updateLevels);
        };
        
        updateLevels();
        
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [analyser, isPlaying]);

    return (
        <div className="flex justify-center items-end gap-3 h-auto my-8">
            {levels.map((level, i) => (
                <motion.div
                    key={i}
                    className="w-6 h-4 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-t-md"
                    animate={{ opacity: level }}
                    transition={{ duration: 0.05 }}
                />
            ))}
        </div>
    );
};


const AuroraMusicBox: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const musicInfra = useRef<{ synth: Tone.FMSynth, analyser: Tone.Analyser, sequence: Tone.Sequence } | null>(null);

  const setupMusic = async () => {
    setIsLoading(true);
    // Ensure Tone.js is started by a user gesture
    await Tone.start();

    // Fetch mock data
    const solarData = await fetchSolarData();
    setIsLoading(false);

    // Create synth and analyser if they don't exist
    if (!musicInfra.current) {
        const synth = new Tone.FMSynth({
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 },
            harmonicity: 3,
            modulationIndex: 10,
        }).toDestination();
        const analyser = new Tone.Analyser('waveform', 128);
        synth.connect(analyser);
        musicInfra.current = { synth, analyser, sequence: null as any };
    }
    
    const { synth } = musicInfra.current;

    // Map solar data to music properties
    const tempo = mapValue(solarData.windSpeed, 300, 800, 70, 140);
    const scale = solarData.geoIndex > 5
        ? ['C4', 'D#4', 'G4', 'G#4', 'C5'] // More complex, "active" scale
        : ['C3', 'E3', 'G3', 'A3', 'C4'];  // Calmer, major pentatonic scale

    const noteDuration = solarData.geoIndex > 5 ? '16n' : '8n';

    // Create a new sequence
    const sequence = new Tone.Sequence((time, note) => {
        synth.triggerAttackRelease(note, noteDuration, time);
    }, scale, '4n').start(0);

    musicInfra.current.sequence = sequence;

    // Set transport properties and start
    Tone.Transport.bpm.value = tempo;
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopMusic = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    if(musicInfra.current?.sequence) {
        musicInfra.current.sequence.dispose();
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      setupMusic();
    }
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopMusic();
      musicInfra.current?.synth.dispose();
      musicInfra.current?.analyser.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 rounded-2xl shadow-2xl p-8 overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full">
            <h2 className="text-5xl font-bold mb-2 text-cyan-300" style={{ textShadow: '0 0 12px rgba(103, 232, 249, 0.5)' }}>
                Aurora Music Box
            </h2>
            <p className="text-lg text-gray-300/90 font-light">
                Listen to Today's Sun
            </p>
            
            <MusicVisualizer analyser={musicInfra.current?.analyser || null} isPlaying={isPlaying} />

            <motion.button
                onClick={handleTogglePlay}
                disabled={isLoading}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-blue-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isLoading ? 'Tuning into the Sun...' : (isPlaying ? 'Stop Solar Music' : 'Play Solar Music')}
            </motion.button>
        </div>
    </div>
  );
};

export default AuroraMusicBox;