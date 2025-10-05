import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface MissionEvent {
  id: number;
  name: string;
  type: 'Weather' | 'Environment' | 'Comms';
  location: { x: number; y: number }; // percentages
  requiredScans: number;
  scansDone: number;
}
interface Satellite {
  id: number;
  name: string;
  type: 'Weather' | 'Environment' | 'Comms';
  isDeployed: boolean;
  targetEventId: number | null;
  location: { x: number; y: number }; // For beam origin
}

const initialSatellites: Omit<Satellite, 'location'>[] = [
    { id: 1, name: 'Atmo-1', type: 'Weather', isDeployed: false, targetEventId: null },
    { id: 2, name: 'EcoSat', type: 'Environment', isDeployed: false, targetEventId: null },
    { id: 3, name: 'LinkStar', type: 'Comms', isDeployed: false, targetEventId: null },
];

const GlobalMissionGame: React.FC<{ addAchievement: (id: string) => void }> = ({ addAchievement }) => {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'win' | 'lose'>('start');
    const [timeLeft, setTimeLeft] = useState(180);
    const [researchProgress, setResearchProgress] = useState(0);
    const [events, setEvents] = useState<MissionEvent[]>([]);
    const [satellites, setSatellites] = useState<Satellite[]>([]);
    const [selectedSat, setSelectedSat] = useState<Satellite | null>(null);
    const [errorFlashEventId, setErrorFlashEventId] = useState<number | null>(null);

    const eventInterval = useRef<number | null>(null);
    const timerInterval = useRef<number | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    const startGame = () => {
        setGameState('playing');
        setTimeLeft(180);
        setResearchProgress(0);
        setEvents([]);
        
        // Position satellites in the UI panel for beam origins
        const satLocations = [ { x: 15, y: -10 }, { x: 50, y: -10 }, { x: 85, y: -10 }];
        setSatellites(initialSatellites.map((s, i) => ({
            ...s, 
            isDeployed: false, 
            targetEventId: null,
            location: satLocations[i]
        })));
        
        spawnEvent();
        eventInterval.current = window.setInterval(spawnEvent, 8000);
        timerInterval.current = window.setInterval(() => setTimeLeft(t => t-1), 1000);
    };

    const spawnEvent = () => {
        setEvents(prev => {
            if (prev.length >= 5) return prev; // Limit concurrent events
            const eventTypes: ('Weather' | 'Environment' | 'Comms')[] = ['Weather', 'Environment', 'Comms'];
            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const name = type === 'Weather' ? 'Hurricane' : type === 'Environment' ? 'Wildfire' : 'Comms Blackout';
            const requiredScans = researchProgress > 50 && Math.random() > 0.6 ? 4 : 3;
            
            return [...prev, {
                id: Date.now() + Math.random(),
                name,
                type,
                location: { x: Math.random() * 70 + 15, y: Math.random() * 70 + 15 },
                requiredScans,
                scansDone: 0,
            }];
        });
    };

    const selectSatellite = (sat: Satellite) => {
        if (!sat.isDeployed && gameState === 'playing') {
            setSelectedSat(s => s?.id === sat.id ? null : sat);
        }
    };

    const deploySatellite = (event: MissionEvent) => {
        if (!selectedSat) return;

        if (selectedSat.type !== event.type) {
            setErrorFlashEventId(event.id);
            setTimeout(() => setErrorFlashEventId(null), 500);
            return;
        }
        setSatellites(sats => sats.map(s => s.id === selectedSat.id ? { ...s, isDeployed: true, targetEventId: event.id } : s));
        setSelectedSat(null);
    };

    // Main game logic loop for scanning and event completion
    useEffect(() => {
        if (gameState !== 'playing') return;

        const scanInterval = setInterval(() => {
            let progressMadeThisTick = false;
            let completedEventIds: number[] = [];

            setEvents(currentEvents => {
                // Return a new array after mapping
                const updatedEvents = currentEvents.map(event => {
                    const isScanning = satellites.some(s => s.targetEventId === event.id);
                    if (isScanning && event.scansDone < event.requiredScans) {
                        progressMadeThisTick = true;
                        const newScansDone = event.scansDone + 1;
                        if (newScansDone >= event.requiredScans) {
                            completedEventIds.push(event.id);
                        }
                        return { ...event, scansDone: newScansDone };
                    }
                    return event;
                });

                // Filter out completed events
                return updatedEvents.filter(e => !completedEventIds.includes(e.id));
            });

            if (progressMadeThisTick) {
                setResearchProgress(p => Math.min(100, p + 5));
            }

            // After events are updated, free up the satellites from completed events
            if (completedEventIds.length > 0) {
                setSatellites(currentSatellites => 
                    currentSatellites.map(sat => 
                        completedEventIds.includes(sat.targetEventId!) 
                            ? { ...sat, isDeployed: false, targetEventId: null } 
                            : sat
                    )
                );
            }
        }, 2000);

        return () => clearInterval(scanInterval);
    }, [gameState, satellites]);


    // Game state win/loss checks
    useEffect(() => {
        if (gameState !== 'playing') return;
        if (timeLeft <= 0) setGameState('lose');
        if (researchProgress >= 100) {
            setGameState('win');
            // addAchievement('global-savior');
        }
    }, [timeLeft, researchProgress, gameState, addAchievement]);

    // Interval clearing and dynamic difficulty
    useEffect(() => {
        // Adjust event spawn rate based on progress
        if(gameState === 'playing') {
            if (eventInterval.current) clearInterval(eventInterval.current);
            const newInterval = Math.max(4000, 8000 - (researchProgress * 35));
            eventInterval.current = window.setInterval(spawnEvent, newInterval);
        }

        if (gameState !== 'playing') {
            if (eventInterval.current) clearInterval(eventInterval.current);
            if (timerInterval.current) clearInterval(timerInterval.current);
        }
        return () => {
            if (eventInterval.current) clearInterval(eventInterval.current);
            if (timerInterval.current) clearInterval(timerInterval.current);
        };
    }, [gameState, researchProgress]);

    const renderGameStateOverlay = () => {
        if (gameState === 'start' || gameState === 'win' || gameState === 'lose') {
            const messages = {
                start: { title: 'Global Mission Control', text: 'Deploy satellites to monitor global events and complete research before time runs out.' },
                win: { title: 'Mission Success!', text: `You completed the research with ${timeLeft} seconds remaining!` },
                lose: { title: 'Mission Failed', text: timeLeft <= 0 ? 'You ran out of time.' : 'The network is down.' },
            };
            const current = messages[gameState];
            return (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center z-20">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                        <h2 className="text-4xl font-bold text-sky-300 mb-4">{current.title}</h2>
                        <p className="text-violet-200 mb-8 max-w-sm">{current.text}</p>
                        <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105">
                            {gameState === 'start' ? 'Start Mission' : 'Play Again'}
                        </button>
                    </motion.div>
                </div>
            )
        }
        return null;
    }

    const satIcons = { Weather: '🛰️', Environment: '🌲', Comms: '📡' };

    const deployedSatellites = satellites.filter(s => s.isDeployed && s.targetEventId !== null);

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <h3 className="text-xl font-bold mb-4 text-center">Mission: Global Mission Control</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">Monitor Earth from orbit! Deploy the correct satellite type to study global events. Fill the research bar before time runs out!</p>

            <div 
                ref={mapRef}
                className={`relative aspect-video w-full rounded-lg overflow-hidden bg-blue-900/50 border border-violet-600/50 ${selectedSat ? 'cursor-crosshair' : ''}`}
            >
                <div className="absolute inset-0 bg-cover bg-center animate-rotate-globe" style={{ backgroundImage: 'url(https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg)' }} />
                
                {renderGameStateOverlay()}

                <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                    <defs>
                        <linearGradient id="beamGradient" gradientTransform="rotate(90)">
                            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0" />
                            <stop offset="50%" stopColor="#67e8f9" />
                            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <AnimatePresence>
                    {deployedSatellites.map(sat => {
                        const targetEvent = events.find(e => e.id === sat.targetEventId);
                        if (!targetEvent || !mapRef.current) return null;
                        
                        const mapSize = mapRef.current.getBoundingClientRect();
                        const satPanelHeight = 80; // Approximate height of the panel below
                        const satX = (1 - (sat.location.x / 100)) * (mapSize?.width || 0); // Flipped for visual appeal
                        const satY = satPanelHeight;
                        const eventX = (targetEvent.location.x / 100) * (mapSize?.width || 0);
                        const eventY = (targetEvent.location.y / 100) * (mapSize?.height || 0);

                        return (
                            <motion.line
                                key={sat.id}
                                x1={eventX} y1={eventY}
                                x2={eventX} y2={eventY}
                                stroke="url(#beamGradient)"
                                strokeWidth="2"
                                initial={{ opacity: 0, x2: eventX, y2: eventY }}
                                animate={{ opacity: 1, x2: satX, y2: satY }}
                                exit={{ opacity: 0, x2: eventX, y2: eventY}}
                                transition={{ duration: 0.5 }}
                            />
                        );
                    })}
                    </AnimatePresence>
                </svg>

                <AnimatePresence>
                {events.map(event => {
                    const isInvalid = errorFlashEventId === event.id;
                    const isValidTarget = selectedSat && selectedSat.type === event.type;
                    return (
                        <motion.button 
                            key={event.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, x: isInvalid ? [-3, 3, -3, 0] : 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ x: { duration: 0.4, ease: "easeInOut" }}}
                            onClick={() => deploySatellite(event)}
                            className={`absolute flex flex-col items-center p-2 rounded-lg z-10 
                                      ${selectedSat ? 'cursor-pointer hover:bg-white/20' : 'cursor-default'}
                                      `}
                            style={{ left: `${event.location.x}%`, top: `${event.location.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className={`text-4xl transition-transform ${isValidTarget ? 'scale-125' : ''}`}>
                                {event.type === 'Weather' ? '🌪️' : event.type === 'Environment' ? '🔥' : '📶'}
                                {isValidTarget && <div className="absolute -inset-2 bg-green-400/50 rounded-full animate-pulse -z-10"></div>}
                            </div>
                            <div className="w-20 h-2 bg-gray-500/80 rounded-full mt-2 overflow-hidden border border-gray-900/50">
                                <motion.div className="bg-green-500 h-full" initial={{width: 0}} animate={{width: `${(event.scansDone / event.requiredScans) * 100}%`}} />
                            </div>
                        </motion.button>
                    );
                })}
                </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 p-2 rounded-xl bg-black/30">
                    {satellites.map(sat => (
                        <button 
                            key={sat.id}
                            onClick={() => selectSatellite(sat)}
                            disabled={sat.isDeployed}
                            className={`p-3 rounded-lg border-2 transition-all w-24 text-center
                                      ${sat.isDeployed ? 'bg-gray-700/50 border-gray-600 opacity-50' : 'bg-violet-800/60 border-violet-600 hover:bg-violet-700'}
                                      ${selectedSat?.id === sat.id ? 'ring-2 ring-sky-400 scale-110' : ''}`}
                        >
                            <div className="text-3xl">{satIcons[sat.type]}</div>
                            <div className="text-xs font-bold">{sat.name}</div>
                             <AnimatePresence>
                            {sat.isDeployed && 
                                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-xs text-sky-300 font-semibold">Deployed</motion.div>
                            }
                            </AnimatePresence>
                        </button>
                    ))}
                </div>
                <div className="text-right bg-black/30 p-3 rounded-xl">
                    <div className="font-bold text-lg">Time Left: <span className={timeLeft < 30 ? 'text-red-400' : 'text-white'}>{timeLeft}s</span></div>
                    <div className="w-48 h-4 bg-gray-700 rounded-full overflow-hidden mt-1 border border-black/50">
                        <motion.div className="bg-gradient-to-r from-sky-400 to-cyan-300 h-full" initial={{width: 0}} animate={{width: `${researchProgress}%`}} transition={{ duration: 0.5 }} />
                    </div>
                    <div className="text-sm mt-1 text-violet-300">Research Progress</div>
                </div>
            </div>
        </div>
    );
};

export default GlobalMissionGame;
