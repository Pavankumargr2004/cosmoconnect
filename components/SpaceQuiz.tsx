import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';

// Positions, backgrounds, and icons for the star map journey
const quizData = [
  {
    level: 1,
    title: 'Earth Basics',
    icon: '🌍',
    position: { top: '88%', left: '25%' },
    backgroundUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1200&auto-format=fit-crop',
    questions: [
      { question: "What gives us light and heat on Earth?", options: ["The Moon", "The Sun", "Stars", "Planets"], correct: 1 },
      { question: "What do we call the colorful lights in the sky caused by solar energy?", options: ["Rainbows", "Auroras", "Comets", "Lightning"], correct: 1 },
      { question: "Who is Sunny in CosmoConnect?", options: ["An astronaut", "A solar flare", "A star", "A comet"], correct: 1 },
    ],
  },
  {
    level: 2,
    title: 'Sun & Weather',
    icon: '☀️',
    position: { top: '69%', left: '75%' },
    backgroundUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256ec346?q=80&w=1200&auto-format=fit-crop',
    questions: [
      { question: "What is a solar flare?", options: ["An explosion of energy from the Sun", "A type of planet", "A space rock", "A bright star"], correct: 0 },
      { question: "What protects Earth from harmful solar radiation?", options: ["Clouds", "Earth’s magnetosphere", "The Moon", "The oceans"], correct: 1 },
      { question: "What can space weather sometimes disturb?", options: ["Internet and GPS", "Mountains", "Air pressure", "Volcanoes"], correct: 0 },
    ],
  },
  {
    level: 3,
    title: 'Telescope Tech',
    icon: '🛰️',
    position: { top: '50%', left: '25%' },
    backgroundUrl: 'https://images.unsplash.com/photo-1543336398-3a85b244d2de?q=80&w=1200&auto-format=fit-crop',
    questions: [
      { question: "Which NASA mission studies the Sun closely?", options: ["Parker Solar Probe", "Apollo 11", "Hubble Telescope", "Curiosity Rover"], correct: 0 },
      { question: "What telescope helps scientists see the earliest galaxies?", options: ["James Webb Space Telescope", "Galileo Telescope", "Kepler", "Hubble"], correct: 0 },
      { question: "What tool in CosmoConnect shows real CME data?", options: ["Solar Storybook", "CME Analysis Tool", "Space Painter", "Aurora Tales"], correct: 1 },
    ],
  },
  {
    level: 4,
    title: 'Nebula Nursery',
    icon: '✨',
    position: { top: '31%', left: '75%' },
    backgroundUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto-format=fit=crop',
    questions: [
      { question: "What can you do in “Design-A-Planet”?", options: ["Create your own planet with AI help", "Fly a rocket", "Build satellites", "Draw stars"], correct: 0 },
      { question: "What is “Sunny in Your World”?", options: ["An AR mode showing Sunny around you", "A TV show", "A telescope", "A planet name"], correct: 0 },
      { question: "What does “Cosmo Buddy” do?", options: ["Answers space questions", "Plays games", "Takes photos", "Shows maps"], correct: 0 },
    ],
  },
  {
    level: 5,
    title: 'Galaxy Brain',
    icon: '🌌',
    position: { top: '12%', left: '25%' },
    backgroundUrl: 'https://images.unsplash.com/photo-1506443432602-ac2dcd7e20de?q=80&w=1200&auto-format=fit=crop',
    questions: [
      { question: "Why is studying space weather important?", options: ["It affects satellites and power systems", "It makes stars twinkle", "It causes rain", "It changes seasons"], correct: 0 },
      { question: "What happens when a strong CME reaches Earth?", options: ["Magnetic storms and auroras", "Earth stops rotating", "Rain begins", "Earth gets hotter"], correct: 0 },
      { question: "What is the main goal of CosmoConnect?", options: ["To make space science fun for everyone", "To sell space rockets", "To explore oceans", "To teach cooking"], correct: 0 },
    ],
  },
];


const ConfettiPiece: React.FC<{ initialX: number; initialY: number }> = ({ initialX, initialY }) => {
    const colors = ['#22d3ee', '#818cf8', '#a78bfa', '#f472b6', '#fbbf24'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 2 + 3; 
    const endX = (Math.random() - 0.5) * window.innerWidth * 0.8;
    const endY = window.innerHeight * 0.5;
    const rotate = Math.random() * 540 - 270;

    return (
        <motion.div
            style={{
                position: 'fixed',
                left: initialX,
                top: initialY,
                width: '12px',
                height: '12px',
                backgroundColor: color,
                opacity: 1,
                zIndex: 100
            }}
            animate={{ x: endX, y: endY, rotate: rotate, opacity: 0 }}
            transition={{ duration: duration, ease: "easeOut" }}
        />
    );
};

const Confetti: React.FC = () => {
    const [pieces, setPieces] = useState<React.ReactElement[]>([]);
    useEffect(() => {
        const x = window.innerWidth / 2;
        const y = window.innerHeight * 0.3;
        const newPieces = Array.from({ length: 80 }).map((_, i) => (
            <ConfettiPiece key={i} initialX={x} initialY={y} />
        ));
        setPieces(newPieces);
    }, []);
    return <>{pieces}</>;
};

interface SpaceQuizProps {
    addAchievement: (id: string) => void;
}

const SpaceQuiz: React.FC<SpaceQuizProps> = ({ addAchievement }) => {
    const [levelStatus, setLevelStatus] = useState<('locked' | 'unlocked' | 'completed')[]>(
        ['unlocked', ...Array(quizData.length - 1).fill('locked')]
    );
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<{ index: number; isCorrect: boolean } | null>(null);
    const [quizState, setQuizState] = useState<'selecting_level' | 'in_level' | 'level_complete' | 'quiz_complete'>('selecting_level');
    const [showConfetti, setShowConfetti] = useState(false);
    const [rocketPositionIndex, setRocketPositionIndex] = useState(0);
    
    const [pathD, setPathD] = useState('');
    const [pathProgressPoints, setPathProgressPoints] = useState<number[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const levelRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);

    const sounds = useRef<{ correct: Tone.Synth, incorrect: Tone.Synth, levelUp: Tone.PolySynth } | null>(null);

    useEffect(() => {
        const initialRocketIndex = levelStatus.findIndex(s => s === 'unlocked');
        if (initialRocketIndex !== -1) {
            setRocketPositionIndex(initialRocketIndex);
        }

        sounds.current = {
            correct: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination(),
            incorrect: new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 } }).toDestination(),
            levelUp: new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.5 } }).toDestination(),
        };
        
        const calculatePath = () => {
            if (!containerRef.current || levelRefs.current.length < quizData.length || levelRefs.current.some(ref => !ref)) {
                return;
            }
            
            const areRefsReady = levelRefs.current.every(ref => ref && ref.offsetWidth > 0 && ref.offsetHeight > 0);
            if (!areRefsReady) return;

            const points = levelRefs.current.map(ref => {
                const rect = ref!.getBoundingClientRect();
                const containerRect = containerRef.current!.getBoundingClientRect();
                const x = rect.left - containerRect.left + rect.width / 2;
                const y = rect.top - containerRect.top + rect.height / 2;
                return { x, y };
            });

            if (points.length > 0) {
                const newPathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                setPathD(newPathD);

                const tempPathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
                tempPathEl.setAttribute("d", newPathD);
                const totalLength = tempPathEl.getTotalLength();

                if (totalLength > 0) {
                    const newProgressPoints = points.map((_, i) => {
                        if (i === 0) return 0;
                        const subPathD = points.slice(0, i + 1).map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        tempPathEl.setAttribute("d", subPathD);
                        return tempPathEl.getTotalLength() / totalLength;
                    });
                    setPathProgressPoints(newProgressPoints);
                }
            }
        };

        const intervalId = setInterval(() => {
            if (levelRefs.current.length === quizData.length && !levelRefs.current.some(r => !r)) {
                calculatePath();
                clearInterval(intervalId);
            }
        }, 100);

        const resizeObserver = new ResizeObserver(calculatePath);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        
        return () => {
            sounds.current?.correct.dispose();
            sounds.current?.incorrect.dispose();
            sounds.current?.levelUp.dispose();
            clearInterval(intervalId);
            resizeObserver.disconnect();
        }
    }, []);

    useEffect(() => {
        const canvas = backgroundCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        let width = 0, height = 0;

        class Star {
            x: number; y: number; z: number;
            radius: number; alpha: number;

            constructor() {
                this.x = Math.random() * 2 - 1;
                this.y = Math.random() * 2 - 1;
                this.z = Math.random() * 2;
                this.radius = Math.random() * 1.2 + 0.3;
                this.alpha = 0.5 + Math.random() * 0.5;
            }

            update() {
                this.z -= 0.003; // Speed of travel
                if (this.z < 0.1) {
                    this.z = 2;
                    this.x = Math.random() * 2 - 1;
                    this.y = Math.random() * 2 - 1;
                }
            }

            draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
                const sx = (this.x / this.z) * width / 2 + width / 2;
                const sy = (this.y / this.z) * height / 2 + height / 2;
                const radius = this.radius / this.z;

                if (sx < 0 || sx > width || sy < 0 || sy > height) {
                    this.z = 2;
                    this.x = Math.random() * 2 - 1;
                    this.y = Math.random() * 2 - 1;
                    return;
                }

                ctx.beginPath();
                ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.fill();
            }
        }

        const resize = () => {
            if (!canvas.parentElement) return;
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
            stars = Array.from({ length: 400 }, () => new Star());
        };

        const animate = () => {
            ctx.fillStyle = '#0a0a2a';
            ctx.fillRect(0, 0, width, height);
            stars.forEach(star => {
                star.update();
                star.draw(ctx, width, height);
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        
        const parentEl = canvas.parentElement;
        if (!parentEl) return;

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(resize);
        });
        resizeObserver.observe(parentEl);
        
        resize();
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, []);

    const playSound = async (sound: 'correct' | 'incorrect' | 'levelUp') => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        if (!sounds.current) return;
        if (sound === 'correct') sounds.current.correct.triggerAttackRelease('C5', '8n');
        if (sound === 'incorrect') sounds.current.incorrect.triggerAttackRelease('A2', '8n');
        if (sound === 'levelUp') sounds.current.levelUp.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '8n', Tone.now());
    };

    const selectLevel = (levelIndex: number) => {
        if (levelStatus[levelIndex] === 'locked') return;
        setCurrentLevelIndex(levelIndex);
        setActiveQuestionIndex(0);
        setSelectedAnswer(null);
        setQuizState('in_level');
    };

    const handleAnswer = (answerIndex: number) => {
        if (selectedAnswer) return;
        const isCorrect = answerIndex === quizData[currentLevelIndex].questions[activeQuestionIndex].correct;
        setSelectedAnswer({ index: answerIndex, isCorrect });
        if (isCorrect) {
            setScore(s => s + 1);
            playSound('correct');
        } else {
            playSound('incorrect');
        }
    };

    const handleNext = () => {
        if (!selectedAnswer) return;
        const currentLevel = quizData[currentLevelIndex];
        if (activeQuestionIndex < currentLevel.questions.length - 1) {
            setActiveQuestionIndex(q => q + 1);
            setSelectedAnswer(null);
        } else {
            setQuizState('level_complete');
            playSound('levelUp');
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);

            const newStatus = [...levelStatus];
            newStatus[currentLevelIndex] = 'completed';
            if (currentLevelIndex + 1 < quizData.length) {
                newStatus[currentLevelIndex + 1] = 'unlocked';
            }
            setLevelStatus(newStatus);
        }
    };
    
    const goToNextLevel = () => {
        setQuizState('selecting_level');
        if (currentLevelIndex < quizData.length - 1) {
             setTimeout(() => {
                setRocketPositionIndex(currentLevelIndex + 1);
             }, 100);
        } else {
            setQuizState('quiz_complete');
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
            addAchievement('cosmic-scholar');
        }
    }
    
    const restartQuiz = () => {
        setLevelStatus(['unlocked', ...Array(quizData.length - 1).fill('locked')]);
        setCurrentLevelIndex(0);
        setActiveQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setQuizState('selecting_level');
        setRocketPositionIndex(0);
    };

    const getFinalMessage = () => {
        const totalQuestions = quizData.reduce((sum, level) => sum + level.questions.length, 0);
        if (score >= totalQuestions * 0.8) return { title: '🌟 Space Explorer!', message: "Your knowledge is as vast as the universe!" };
        if (score >= totalQuestions * 0.5) return { title: '🚀 Budding Scientist!', message: "You're on a trajectory to greatness!" };
        return { title: '✨ Keep Exploring!', message: "Every question is a new star to discover!" };
    };
    
    const renderContent = () => {
        switch(quizState) {
            case 'in_level':
                const level = quizData[currentLevelIndex];
                const question = level.questions[activeQuestionIndex];
                const progress = ((activeQuestionIndex + 1) / level.questions.length) * 100;
                
                return (
                    <motion.div 
                        key={`level-${currentLevelIndex}`} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full rounded-2xl flex flex-col items-center justify-center p-4 sm:p-8 bg-black/60"
                    >
                        <div className="mb-4 text-center">
                            <p className="font-bold text-lg text-violet-300">Level {currentLevelIndex + 1} &bull; Score: {score}</p>
                            <h2 className="text-2xl font-bold text-sky-300">{level.title}</h2>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2.5 mb-6">
                            <motion.div className="bg-gradient-to-r from-sky-400 to-cyan-300 h-2.5 rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div key={activeQuestionIndex} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }} className="w-full max-w-3xl">
                                <p className="text-xl md:text-2xl text-center text-white mb-6 min-h-[4rem]">{question.question}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {question.options.map((option, index) => {
                                        const isCorrectAnswer = index === question.correct;
                                        const isSelected = selectedAnswer?.index === index;
                                        let animateProps = {};
                                        if(selectedAnswer && isSelected && !selectedAnswer.isCorrect) animateProps = { x: [-3, 3, -3, 0] };

                                        return (
                                            <motion.button
                                                key={index}
                                                onClick={() => handleAnswer(index)}
                                                disabled={!!selectedAnswer}
                                                className={`p-4 rounded-lg font-semibold text-lg transition-all duration-300 disabled:cursor-not-allowed border-2
                                                    ${selectedAnswer ? 'border-transparent' : 'border-violet-600/50 bg-violet-900/40 hover:bg-violet-800/60 hover:border-violet-500'}
                                                    ${selectedAnswer && isCorrectAnswer ? 'bg-green-500/80 text-white shadow-lg shadow-green-500/30' : ''}
                                                    ${selectedAnswer && isSelected && !isCorrectAnswer ? 'bg-red-500/80 text-white' : ''}
                                                    ${selectedAnswer && !isSelected ? 'bg-gray-700/50 text-gray-400' : ''}
                                                `}
                                                whileHover={{ scale: selectedAnswer ? 1 : 1.03 }}
                                                whileTap={{ scale: selectedAnswer ? 1 : 0.97 }}
                                                animate={animateProps}
                                            >
                                                {option}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                        {selectedAnswer && (
                            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleNext} className="mt-8 mx-auto block px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-full shadow-lg hover:shadow-cyan-400/50">
                                Next
                            </motion.button>
                        )}
                    </motion.div>
                );

            case 'level_complete':
                const completedLevel = quizData[currentLevelIndex];
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                        <p className="text-6xl mb-4">🎉</p>
                        <h2 className="text-3xl font-bold text-green-400">Level {completedLevel.level} Complete!</h2>
                        <p className="text-violet-200 mt-2">Awesome job! Ready for the next challenge?</p>
                        <motion.button onClick={goToNextLevel} className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-full shadow-lg" whileHover={{ scale: 1.05 }}>
                            {currentLevelIndex < quizData.length - 1 ? 'Next Level' : 'Finish Quiz'}
                        </motion.button>
                    </motion.div>
                );

            case 'quiz_complete':
                const { title, message } = getFinalMessage();
                const totalQuestions = quizData.reduce((sum, level) => sum + level.questions.length, 0);
                return (
                     <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                        <h2 className="text-4xl font-bold text-amber-400">{title}</h2>
                        <p className="text-2xl text-violet-200 mt-4">Your final score is {score} out of {totalQuestions}!</p>
                        <p className="text-violet-300 mt-2">{message}</p>
                        <motion.button onClick={restartQuiz} className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-full shadow-lg" whileHover={{ scale: 1.05 }}>
                            Play Again
                        </motion.button>
                    </motion.div>
                );

            case 'selecting_level':
            default:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col p-4">
                        <div className="text-center mb-4 flex-shrink-0">
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">Cosmic Quest</h1>
                            <p className="text-violet-300 mt-2">Complete levels to travel across the universe!</p>
                        </div>
                         <div 
                            ref={containerRef} 
                            className="w-full h-full relative bg-black/40 rounded-3xl p-4 overflow-hidden border-2 border-violet-700/50 shadow-2xl shadow-violet-500/20 flex-grow"
                        >
                            <svg width="100%" height="100%" className="absolute inset-0 overflow-visible z-0">
                                {pathD && (
                                    <>
                                        <path d={pathD} fill="none" stroke="#4b5563" strokeWidth="4" strokeDasharray="8 8" />
                                        <motion.path
                                            d={pathD}
                                            fill="none"
                                            stroke="#67e8f9"
                                            strokeWidth="4"
                                            style={{ filter: 'drop-shadow(0 0 6px #67e8f9)' }}
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: pathProgressPoints[rocketPositionIndex] ?? 0 }}
                                            transition={{ duration: 1.5, ease: 'easeInOut' }}
                                        />
                                    </>
                                )}
                            </svg>
                            
                            {pathD && pathProgressPoints.length > 0 && (
                                <motion.div
                                    className="absolute text-4xl z-20"
                                    style={{ 
                                        offsetPath: `path("${pathD}")`, 
                                        transform: 'translate(-50%, -50%)',
                                        offsetDistance: "0%",
                                    }}
                                    animate={{
                                        offsetDistance: `${(pathProgressPoints[rocketPositionIndex] ?? 0) * 100}%`
                                    }}
                                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                                >
                                    🚀
                                </motion.div>
                            )}

                            {quizData.map((level, index) => {
                                const status = levelStatus[index];
                                const isLocked = status === 'locked';
                                const isCompleted = status === 'completed';
                                const isCurrent = status === 'unlocked';
                                return (
                                <button
                                    key={level.level}
                                    ref={el => levelRefs.current[index] = el}
                                    onClick={() => selectLevel(index)}
                                    disabled={isLocked}
                                    className="absolute p-2 rounded-full text-center flex flex-col items-center justify-center disabled:cursor-not-allowed group z-10"
                                    style={{ top: level.position.top, left: level.position.left, transform: 'translate(-50%, -50%)' }}
                                >
                                    <div 
                                        className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl border-4 transition-all duration-300 transform backdrop-blur-sm 
                                        ${!isLocked ? 'group-hover:scale-110' : ''}
                                        ${isLocked ? 'bg-gray-800/70 border-gray-700' : 'bg-violet-900/70'}
                                        ${isCompleted ? 'border-green-500' : 'border-violet-700/50'}
                                        ${isCurrent ? 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.6)] animate-pulse' : 'border-violet-700/50'}
                                        `}
                                    >
                                        {isCompleted ? '✅' : level.icon}
                                    </div>
                                    <span className={`mt-2 font-bold text-sm px-2 py-1 rounded-md bg-black/30 ${isLocked ? 'text-gray-500' : 'text-white'}`}>{level.title}</span>
                                </button>
                                )
                            })}
                        </div>
                    </motion.div>
                );
        }
    }

    return (
        <div className="w-full h-full rounded-2xl shadow-2xl shadow-violet-500/10 border border-violet-700/30 relative overflow-hidden">
            <canvas ref={backgroundCanvasRef} className="absolute inset-0 w-full h-full rounded-2xl"></canvas>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                 {showConfetti && <Confetti />}
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SpaceQuiz;