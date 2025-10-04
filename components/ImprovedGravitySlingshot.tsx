import React, { useRef, useEffect, useState } from 'react';

interface ImprovedGravitySlingshotProps {
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
        target: { pos: { x: 650, y: 225 }, radius: 15, name: 'Moon' },
        planets: [{ pos: { x: 150, y: 225 }, radius: 25, mass: 3000, name: 'Earth', color: '#4682B4' }]
    },
    {
        name: 'Slingshot Around Jupiter',
        probeStart: { x: 150, y: 100 },
        target: { pos: { x: 150, y: 350 }, radius: 15, name: 'Space Station' },
        planets: [{ pos: { x: 400, y: 225 }, radius: 40, mass: 12000, name: 'Jupiter', color: '#d97706' }]
    },
    {
        name: 'Navigate the Asteroid Field',
        probeStart: { x: 100, y: 225 },
        target: { pos: { x: 700, y: 225 }, radius: 15, name: 'Mars Base' },
        planets: [
            { pos: { x: 250, y: 150 }, radius: 15, mass: 2000, name: 'Asteroid', color: '#a16207' },
            { pos: { x: 350, y: 300 }, radius: 20, mass: 4000, name: 'Asteroid', color: '#a16207' },
            { pos: { x: 500, y: 180 }, radius: 18, mass: 3500, name: 'Asteroid', color: '#a16207' }
        ]
    },
    {
        name: 'The Grand Tour',
        probeStart: { x: 100, y: 225 },
        target: { pos: { x: 700, y: 225 }, radius: 20, name: 'Outer Rim' },
        planets: [
            { pos: { x: 200, y: 150 }, radius: 20, mass: 3000, name: 'Venus', color: '#f59e0b' },
            { pos: { x: 400, y: 300 }, radius: 30, mass: 8000, name: 'Saturn', color: '#fbbf24' },
            { pos: { x: 550, y: 150 }, radius: 25, mass: 6000, name: 'Neptune', color: '#60a5fa' }
        ]
    }
];

const ImprovedGravitySlingshot: React.FC<ImprovedGravitySlingshotProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [levelIndex, setLevelIndex] = useState(0);
    const [gameState, setGameState] = useState<'ready' | 'aiming' | 'flying' | 'win' | 'lose'>('ready');
    const [completedLevels, setCompletedLevels] = useState(0);
    const [power, setPower] = useState(0);
    const [angle, setAngle] = useState(0);

    const gameObjects = useRef<{
        probe: Probe;
        target: { pos: Vector2D; radius: number; };
        planets: CelestialBody[];
        stars: any[];
        isCharging: boolean;
        chargeStartTime: number;
    }>({
        probe: { pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, radius: 6, path: [] },
        target: { pos: { x: 0, y: 0 }, radius: 15 },
        planets: [],
        stars: [],
        isCharging: false,
        chargeStartTime: 0
    });

    const animationFrameId = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

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
            radius: 6,
            path: [],
        };
        gameObjects.current.target = { pos: { ...level.target.pos }, radius: level.target.radius };
        gameObjects.current.planets = level.planets.map(p => ({ ...p, pos: { ...p.pos } }));
        gameObjects.current.isCharging = false;
        setGameState('ready');
        setPower(0);
        setAngle(0);
    };

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0c1445');
        gradient.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = gradient;
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

        // Planets with glow effect
        gameObjects.current.planets.forEach(p => {
            // Glow effect
            ctx.shadowBlur = 20;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Planet label
            ctx.fillStyle = 'white';
            ctx.font = '12px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, p.pos.x, p.pos.y + p.radius + 20);
            ctx.textAlign = 'left';
        });
        
        // Target with pulsing effect
        const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(
            gameObjects.current.target.pos.x, 
            gameObjects.current.target.pos.y, 
            gameObjects.current.target.radius * pulse, 
            0, 
            Math.PI * 2
        );
        ctx.stroke();
        ctx.setLineDash([]);

        // Probe Path with gradient
        if (gameObjects.current.probe.path.length > 1) {
            const gradient = ctx.createLinearGradient(
                gameObjects.current.probe.path[0].x,
                gameObjects.current.probe.path[0].y,
                gameObjects.current.probe.pos.x,
                gameObjects.current.probe.pos.y
            );
            gradient.addColorStop(0, 'rgba(103, 232, 249, 0.2)');
            gradient.addColorStop(1, 'rgba(103, 232, 249, 0.8)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.beginPath();
            gameObjects.current.probe.path.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
        }

        // Probe with engine effect
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.arc(gameObjects.current.probe.pos.x, gameObjects.current.probe.pos.y, gameObjects.current.probe.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Engine glow when flying
        if (gameState === 'flying') {
            const gradient = ctx.createRadialGradient(
                gameObjects.current.probe.pos.x, 
                gameObjects.current.probe.pos.y + gameObjects.current.probe.radius + 5,
                0,
                gameObjects.current.probe.pos.x, 
                gameObjects.current.probe.pos.y + gameObjects.current.probe.radius + 5,
                15
            );
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                gameObjects.current.probe.pos.x, 
                gameObjects.current.probe.pos.y + gameObjects.current.probe.radius + 5,
                15, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }

        // Aiming line with power indicator
        if (gameState === 'aiming') {
            const { probe } = gameObjects.current;
            const aimX = probe.pos.x + Math.cos(angle) * power * 2;
            const aimY = probe.pos.y + Math.sin(angle) * power * 2;
            
            // Power line
            const powerGradient = ctx.createLinearGradient(probe.pos.x, probe.pos.y, aimX, aimY);
            powerGradient.addColorStop(0, '#67e8f9');
            powerGradient.addColorStop(1, '#f87171');
            
            ctx.strokeStyle = powerGradient;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(probe.pos.x, probe.pos.y);
            ctx.lineTo(aimX, aimY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Power indicator circle
            ctx.beginPath();
            ctx.arc(aimX, aimY, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#f87171';
            ctx.fill();
        }

        // UI text
        ctx.fillStyle = 'white';
        ctx.font = '20px Orbitron';
        ctx.fillText(`Level: ${levels[levelIndex % levels.length].name}`, 10, 25);
        ctx.fillText(`Completed: ${completedLevels}/${levels.length}`, canvas.width - 250, 25);
        
        // Game State overlays
        if (gameState === 'win' || gameState === 'lose' || gameState === 'ready') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = '40px Orbitron';

            if(gameState === 'win') {
                ctx.fillText('SUCCESS!', canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = '20px Orbitron';
                ctx.fillText('You mastered the gravity!', canvas.width / 2, canvas.height / 2 + 10);
                ctx.fillText('Click to proceed to the next level', canvas.width / 2, canvas.height / 2 + 40);
            } else if (gameState === 'lose') {
                ctx.fillText('MISSION FAILED', canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = '20px Orbitron';
                ctx.fillText('Try adjusting your trajectory', canvas.width / 2, canvas.height / 2 + 10);
                ctx.fillText('Click to try again', canvas.width / 2, canvas.height / 2 + 40);
            } else { // ready
                 ctx.font = '20px Orbitron';
                 ctx.fillText('Click and hold to charge power, release to launch', canvas.width / 2, canvas.height / 2 - 20);
                 ctx.fillText('Drag to aim your trajectory', canvas.width / 2, canvas.height / 2 + 10);
                 ctx.fillText('Reach the yellow target using gravity!', canvas.width / 2, canvas.height / 2 + 40);
            }
            ctx.textAlign = 'left';
        }
    };

    const gameLoop = (timestamp: number) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;

        if (gameState === 'flying') {
            const { probe, planets, target } = gameObjects.current;
            
            // Apply gravity from all planets
            planets.forEach(p => {
                const dx = p.pos.x - probe.pos.x;
                const dy = p.pos.y - probe.pos.y;
                const distSq = dx * dx + dy * dy;
                if (distSq > 1) { // Avoid division by zero
                    // More realistic gravity: force is proportional to mass and inversely proportional to square of distance
                    const force = (p.mass * 0.1) / distSq;
                    probe.vel.x += force * dx / Math.sqrt(distSq);
                    probe.vel.y += force * dy / Math.sqrt(distSq);
                }
            });

            // Update position
            probe.pos.x += probe.vel.x * (deltaTime / 16);
            probe.pos.y += probe.vel.y * (deltaTime / 16);
            
            // Record path (every 5 pixels)
            if(probe.path.length === 0 || 
               Math.hypot(
                   probe.pos.x - probe.path[probe.path.length-1].x, 
                   probe.pos.y - probe.path[probe.path.length-1].y
               ) > 5) {
                probe.path.push({ ...probe.pos });
            }

            // Check win/lose conditions
            if (Math.hypot(probe.pos.x - target.pos.x, probe.pos.y - target.pos.y) < target.radius + probe.radius) {
                setGameState('win');
                setCompletedLevels(c => c + 1);
            } else if (
                probe.pos.x < -50 || 
                probe.pos.x > canvas.width + 50 || 
                probe.pos.y < -50 || 
                probe.pos.y > canvas.height + 50
            ) {
                setGameState('lose');
            } else {
                // Check collision with planets
                let collision = false;
                planets.forEach(p => {
                    if (Math.hypot(probe.pos.x - p.pos.x, probe.pos.y - p.pos.y) < p.radius + probe.radius) {
                        collision = true;
                    }
                });
                
                if (collision) {
                    setGameState('lose');
                }
            }
        }
        
        // Handle charging
        if (gameObjects.current.isCharging && gameState === 'aiming') {
            const chargeTime = timestamp - gameObjects.current.chargeStartTime;
            setPower(Math.min(50, chargeTime / 20)); // Cap power at 50
        }
        
        draw(ctx, canvas);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Initialize stars
        const stars = [];
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                alpha: Math.random() * 0.8 + 0.2,
            });
        }
        gameObjects.current.stars = stars;
        
        setupLevel(levelIndex);

        const handleMouseDown = (e: MouseEvent) => {
            if (gameState === 'ready' || gameState === 'aiming') {
                setGameState('aiming');
                gameObjects.current.isCharging = true;
                gameObjects.current.chargeStartTime = performance.now();
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (gameState === 'aiming' && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const { probe } = gameObjects.current;
                
                // Calculate angle from probe to mouse
                setAngle(Math.atan2(mouseY - probe.pos.y, mouseX - probe.pos.x));
            }
        };
        
        const handleMouseUp = (e: MouseEvent) => {
            if (gameState === 'aiming' && canvasRef.current) {
                const { probe } = gameObjects.current;
                
                // Launch probe with velocity based on power and angle
                probe.vel.x = Math.cos(angle) * power * 0.2;
                probe.vel.y = Math.sin(angle) * power * 0.2;

                setGameState('flying');
                gameObjects.current.isCharging = false;
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
        
        lastTimeRef.current = performance.now();
        animationFrameId.current = requestAnimationFrame(gameLoop);
        
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('click', handleCanvasClick);
        };
    }, [levelIndex, angle, power]);

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <h3 className="text-xl font-bold mb-4 text-center">Mission: Gravity Slingshot</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">Use planetary gravity to navigate space. Click and hold to charge power, drag to aim, then release to launch. Reach the yellow target!</p>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-stone-900 cursor-pointer">
                 <canvas
                    ref={canvasRef}
                    width={800}
                    height={450}
                    className="w-full h-full"
                />
            </div>
            {gameState === 'aiming' && (
                <div className="mt-2 text-center text-sm text-violet-300">
                    Power: {Math.round(power)} | Angle: {Math.round(angle * 180 / Math.PI)}°
                </div>
            )}
        </div>
    );
};

export default ImprovedGravitySlingshot;