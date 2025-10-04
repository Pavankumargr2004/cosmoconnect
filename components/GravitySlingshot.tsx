import React, { useRef, useEffect, useState } from 'react';

interface GravitySlingshotProps {
    addAchievement: (id: string) => void;
}

// Game object interfaces
interface Vector2D { x: number; y: number; }
interface CelestialBody { pos: Vector2D; radius: number; mass: number; name: string; color: string; }
interface Probe { pos: Vector2D; vel: Vector2D; radius: number; path: Vector2D[]; }

const levels = [
    {
        name: 'Earth to Moon',
        probeStart: { x: 150, y: 225 },
        target: { pos: { x: 650, y: 225 }, radius: 10, name: 'Moon' },
        planets: [{ pos: { x: 150, y: 225 }, radius: 20, mass: 2000, name: 'Earth', color: '#4682B4' }]
    },
    {
        name: 'Slingshot Around Earth',
        probeStart: { x: 150, y: 100 },
        target: { pos: { x: 150, y: 350 }, radius: 15, name: 'Space Station' },
        planets: [{ pos: { x: 400, y: 225 }, radius: 30, mass: 8000, name: 'Earth', color: '#4682B4' }]
    },
    {
        name: 'Navigate the Field',
        probeStart: { x: 100, y: 225 },
        target: { pos: { x: 700, y: 225 }, radius: 15, name: 'Mars' },
        planets: [
            { pos: { x: 300, y: 150 }, radius: 15, mass: 3000, name: 'Asteroid', color: '#a16207' },
            { pos: { x: 500, y: 300 }, radius: 15, mass: 3000, name: 'Asteroid', color: '#a16207' }
        ]
    },
];

const GravitySlingshot: React.FC<GravitySlingshotProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [levelIndex, setLevelIndex] = useState(0);
    const [gameState, setGameState] = useState<'ready' | 'aiming' | 'flying' | 'win' | 'lose'>('ready');
    const [completedLevels, setCompletedLevels] = useState(0);

    const gameObjects = useRef<{
        probe: Probe;
        target: { pos: Vector2D; radius: number; };
        planets: CelestialBody[];
        mouseStart: Vector2D | null;
        stars: any[];
    }>({
        probe: { pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, radius: 5, path: [] },
        target: { pos: { x: 0, y: 0 }, radius: 15 },
        planets: [],
        mouseStart: null,
        stars: []
    });

    const animationFrameId = useRef<number | null>(null);

    // Achievement check
    useEffect(() => {
        if (completedLevels >= 3) {
            addAchievement('orbital-mechanic');
        }
    }, [completedLevels, addAchievement]);
    
    const setupLevel = (levelIdx: number) => {
        const level = levels[levelIdx % levels.length];
        gameObjects.current.probe = {
            pos: { ...level.probeStart },
            vel: { x: 0, y: 0 },
            radius: 5,
            path: [],
        };
        gameObjects.current.target = { pos: { ...level.target.pos }, radius: level.target.radius };
        gameObjects.current.planets = level.planets.map(p => ({ ...p, pos: { ...p.pos } }));
        setGameState('ready');
    };

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Background
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Stars
        ctx.fillStyle = 'white';
        gameObjects.current.stars.forEach(star => {
            ctx.globalAlpha = star.alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Planets
        gameObjects.current.planets.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Target
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(gameObjects.current.target.pos.x, gameObjects.current.target.pos.y, gameObjects.current.target.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Probe Path
        ctx.strokeStyle = 'rgba(103, 232, 249, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        gameObjects.current.probe.path.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Probe
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.arc(gameObjects.current.probe.pos.x, gameObjects.current.probe.pos.y, gameObjects.current.probe.radius, 0, Math.PI * 2);
        ctx.fill();

        // Aiming line
        if (gameState === 'aiming' && gameObjects.current.mouseStart) {
            const { probe, mouseStart } = gameObjects.current;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(probe.pos.x, probe.pos.y);
            ctx.lineTo(mouseStart.x, mouseStart.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // UI text
        ctx.fillStyle = 'white';
        ctx.font = '20px Orbitron';
        ctx.fillText(`Level: ${levels[levelIndex % levels.length].name}`, 10, 25);
        
        // Game State overlays
        if (gameState === 'win' || gameState === 'lose' || gameState === 'ready') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = '40px Orbitron';

            if(gameState === 'win') {
                ctx.fillText('SUCCESS!', canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = '20px Orbitron';
                ctx.fillText('Click to proceed to the next level', canvas.width / 2, canvas.height / 2 + 20);
            } else if (gameState === 'lose') {
                ctx.fillText('MISSION FAILED', canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = '20px Orbitron';
                ctx.fillText('Click to try again', canvas.width / 2, canvas.height / 2 + 20);
            } else { // ready
                 ctx.font = '20px Orbitron';
                 ctx.fillText('Click and drag on the probe to set launch trajectory.', canvas.width / 2, canvas.height / 2);
            }
            ctx.textAlign = 'left';
        }
    };

    const gameLoop = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (gameState === 'flying') {
            const { probe, planets, target } = gameObjects.current;
            
            // Apply gravity
            planets.forEach(p => {
                const dx = p.pos.x - probe.pos.x;
                const dy = p.pos.y - probe.pos.y;
                const distSq = dx * dx + dy * dy;
                if (distSq > 1) { // Avoid division by zero
                    const force = p.mass / distSq;
                    probe.vel.x += force * dx / Math.sqrt(distSq);
                    probe.vel.y += force * dy / Math.sqrt(distSq);
                }
            });

            probe.pos.x += probe.vel.x * 0.1;
            probe.pos.y += probe.vel.y * 0.1;
            
            // Record path
            if(probe.path.length === 0 || Math.hypot(probe.pos.x - probe.path[probe.path.length-1].x, probe.pos.y - probe.path[probe.path.length-1].y) > 2) {
                probe.path.push({ ...probe.pos });
            }

            // Check win/lose conditions
            if (Math.hypot(probe.pos.x - target.pos.x, probe.pos.y - target.pos.y) < target.radius + probe.radius) {
                setGameState('win');
                setCompletedLevels(c => c + 1);
            } else if (probe.pos.x < 0 || probe.pos.x > canvas.width || probe.pos.y < 0 || probe.pos.y > canvas.height) {
                setGameState('lose');
            } else {
                planets.forEach(p => {
                    if (Math.hypot(probe.pos.x - p.pos.x, probe.pos.y - p.pos.y) < p.radius + probe.radius) {
                        setGameState('lose');
                    }
                });
            }
        }
        
        draw(ctx, canvas);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Initialize stars
        const stars = [];
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.2,
                alpha: Math.random() * 0.5 + 0.3,
            });
        }
        gameObjects.current.stars = stars;
        
        setupLevel(levelIndex);

        const handleMouseDown = (e: MouseEvent) => {
            if (gameState === 'ready' || gameState === 'aiming') {
                setGameState('aiming');
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (gameState === 'aiming' && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                gameObjects.current.mouseStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            }
        };
        
        const handleMouseUp = (e: MouseEvent) => {
            if (gameState === 'aiming' && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const mouseEnd = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                const { probe } = gameObjects.current;
                
                probe.vel.x = (probe.pos.x - mouseEnd.x) * 0.1;
                probe.vel.y = (probe.pos.y - mouseEnd.y) * 0.1;

                setGameState('flying');
                gameObjects.current.mouseStart = null;
            }
        };
        
        const handleCanvasClick = () => {
             if (gameState === 'win') {
                const newLevelIndex = levelIndex + 1;
                setLevelIndex(newLevelIndex);
                setupLevel(newLevelIndex);
            } else if (gameState === 'lose') {
                setupLevel(levelIndex);
            }
        }

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('click', handleCanvasClick);
        
        animationFrameId.current = requestAnimationFrame(gameLoop);
        
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('click', handleCanvasClick);
        };
    }, [levelIndex]);

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <h3 className="text-xl font-bold mb-4 text-center">Mission: Gravity Slingshot</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">Use planetary gravity to navigate space. Click and drag from your probe to set its launch trajectory. Your goal is the yellow circle!</p>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-stone-900 cursor-pointer">
                 <canvas
                    ref={canvasRef}
                    width={800}
                    height={450}
                    className="w-full h-full"
                />
            </div>
        </div>
    );
};

export default GravitySlingshot;