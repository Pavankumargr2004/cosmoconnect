import React, { useRef, useEffect, useState } from 'react';

interface AsteroidBeltNavigatorProps {
    addAchievement: (id: string) => void;
}

// Interfaces
interface Player { x: number; y: number; width: number; height: number; }
interface Asteroid { x: number; y: number; radius: number; speed: number; rotation: number; rotationSpeed: number; }
interface Collectible { x: number; y: number; radius: number; speed: number; }
interface PowerUp { x: number; y: number; radius: number; speed: number; type: 'phase' | 'laser'; }
interface Particle { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; life: number; color: string; }
interface Laser { x: number; y: number; width: number; height: number; }

const AsteroidBeltNavigator: React.FC<AsteroidBeltNavigatorProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [score, setScore] = useState(0);
    const startTimeRef = useRef<number>(0);

    const gameObjects = useRef<{
        player: Player;
        asteroids: Asteroid[];
        collectibles: Collectible[];
        powerUps: PowerUp[];
        particles: Particle[];
        lasers: Laser[];
        isPhased: boolean;
        phaseTimer: number;
        hasLaser: boolean;
        stars: { x: number; y: number; z: number; }[];
    }>({
        player: { x: 400, y: 400, width: 40, height: 50 },
        asteroids: [],
        collectibles: [],
        powerUps: [],
        particles: [],
        lasers: [],
        isPhased: false,
        phaseTimer: 0,
        hasLaser: false,
        stars: [],
    });

    const animationFrameId = useRef<number | null>(null);

    const survivedTime = gameState === 'playing' ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    useEffect(() => {
        if (survivedTime >= 60) {
            addAchievement('asteroid-dodger');
        }
    }, [survivedTime, addAchievement]);

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Parallax stars
        gameObjects.current.stars.forEach(star => {
            const sy = (star.y + (Date.now() * 0.02 * star.z)) % canvas.height;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + star.z * 0.7})`;
            ctx.beginPath();
            ctx.arc(star.x, sy, star.z * 1.5, 0, Math.PI * 2);
            ctx.fill();
        });
        
        const { player, isPhased } = gameObjects.current;

        // Player thruster
        ctx.fillStyle = `rgba(255, 180, 100, ${0.5 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y + player.height);
        ctx.lineTo(player.x - player.width/4, player.y + player.height + 15);
        ctx.lineTo(player.x + player.width/4, player.y + player.height + 15);
        ctx.closePath();
        ctx.fill();

        // Player ship
        ctx.globalAlpha = isPhased ? 0.5 + Math.sin(Date.now() / 100) * 0.2 : 1;
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x - player.width / 2, player.y + player.height);
        ctx.lineTo(player.x + player.width / 2, player.y + player.height);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Lasers
        gameObjects.current.lasers.forEach(laser => {
            ctx.fillStyle = '#f87171';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#f87171';
            ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
            ctx.shadowBlur = 0;
        });

        // Asteroids, collectibles, power-ups
        [...gameObjects.current.asteroids, ...gameObjects.current.collectibles, ...gameObjects.current.powerUps].forEach(item => {
            ctx.save();
            ctx.translate(item.x, item.y);
            if ('rotation' in item) ctx.rotate(item.rotation);
            
            if ('rotationSpeed' in item) { // Asteroid
                ctx.fillStyle = '#a16207';
                ctx.beginPath();
                ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
                ctx.fill();
            } else if ('type' in item) { // PowerUp
                ctx.fillStyle = item.type === 'phase' ? '#60a5fa' : '#ef4444';
                ctx.fillRect(-item.radius, -item.radius, item.radius*2, item.radius*2);
            } else { // Collectible
                ctx.fillStyle = '#34d399';
                ctx.beginPath();
                ctx.moveTo(0, -item.radius);
                ctx.lineTo(item.radius, item.radius);
                ctx.lineTo(-item.radius, item.radius);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        });
        
        // Particles
        gameObjects.current.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            ctx.fill();
        });

        // UI
        const timeSurvived = gameState === 'playing' ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
        ctx.fillStyle = 'white';
        ctx.font = '20px Orbitron';
        ctx.fillText(`Score: ${Math.floor(score)}`, 10, 25);
        ctx.fillText(`Time: ${timeSurvived}s`, canvas.width - 150, 25);
        if(gameObjects.current.hasLaser) ctx.fillText(`Laser Ready`, 10, 50);
        if(isPhased) ctx.fillText(`Phase Active!`, 10, 75);

        // Game State Overlay
        if (gameState !== 'playing') {
             ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = 'white';
             ctx.textAlign = 'center';
             if (gameState === 'gameOver') {
                 ctx.font = '40px Orbitron';
                 ctx.fillText('SHIP DESTROYED', canvas.width / 2, canvas.height / 2 - 40);
                 ctx.font = '20px Orbitron';
                 ctx.fillText(`Final Score: ${Math.floor(score)}`, canvas.width / 2, canvas.height / 2);
                 ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 40);
             } else { // start
                 ctx.font = '40px Orbitron';
                 ctx.fillText('Asteroid Belt Navigator', canvas.width / 2, canvas.height / 2 - 40);
                 ctx.font = '20px Orbitron';
                 ctx.fillText('Dodge asteroids and collect Helium-3!', canvas.width / 2, canvas.height / 2);
                 ctx.fillText('Use your mouse to move, click to fire laser.', canvas.width / 2, canvas.height / 2 + 40);
                 ctx.fillText('Click to begin', canvas.width / 2, canvas.height / 2 + 80);
             }
             ctx.textAlign = 'left';
        }
    };

    const createExplosion = (x: number, y: number, color: string) => {
        for (let i = 0; i < 30; i++) {
            gameObjects.current.particles.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, radius: Math.random() * 3 + 1, alpha: 1, life: 40, color });
        }
    };

    const gameLoop = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (gameState === 'playing') {
            const { player, isPhased, phaseTimer, asteroids, collectibles, powerUps, lasers } = gameObjects.current;

            // Score increases with time
            setScore(s => s + 0.1);

            // Update timers
            if (phaseTimer > 0) gameObjects.current.phaseTimer--; else gameObjects.current.isPhased = false;

            // Spawn new items
            const difficulty = 1 + (score / 1000);
            if (Math.random() < 0.02 * difficulty) asteroids.push({ x: Math.random() * canvas.width, y: -20, radius: Math.random() * 20 + 10, speed: (Math.random() * 2 + 1) * difficulty, rotation: 0, rotationSpeed: (Math.random() - 0.5) * 0.1 });
            if (Math.random() < 0.005) collectibles.push({ x: Math.random() * canvas.width, y: -20, radius: 10, speed: 2 * difficulty });
            if (Math.random() < 0.002) powerUps.push({ x: Math.random() * canvas.width, y: -20, radius: 12, speed: 2 * difficulty, type: Math.random() > 0.5 ? 'phase' : 'laser' });
            
            // Update positions
            asteroids.forEach(a => { a.y += a.speed; a.rotation += a.rotationSpeed; });
            collectibles.forEach(c => c.y += c.speed);
            powerUps.forEach(p => p.y += p.speed);
            lasers.forEach(l => l.y -= 15);

            // Filter out off-screen items
            gameObjects.current.asteroids = asteroids.filter(a => a.y < canvas.height + a.radius);
            gameObjects.current.collectibles = collectibles.filter(c => c.y < canvas.height + c.radius);
            gameObjects.current.powerUps = powerUps.filter(p => p.y < canvas.height + p.radius);
            gameObjects.current.lasers = lasers.filter(l => l.y > -l.height);
            
            // Check collisions
            // Laser vs Asteroid
            for (let i = lasers.length - 1; i >= 0; i--) {
                const laser = lasers[i];
                for (let j = asteroids.length - 1; j >= 0; j--) {
                    const asteroid = asteroids[j];
                    if (laser.x > asteroid.x - asteroid.radius && laser.x < asteroid.x + asteroid.radius && laser.y < asteroid.y + asteroid.radius) {
                        createExplosion(asteroid.x, asteroid.y, '161, 98, 7');
                        asteroids.splice(j, 1);
                        lasers.splice(i, 1);
                        setScore(s => s + 10);
                        break;
                    }
                }
            }

            // Player vs Items
            [...asteroids, ...collectibles, ...powerUps].forEach((item, index) => {
                const dist = Math.hypot(item.x - player.x, item.y - (player.y + player.height/2));
                if(dist < item.radius + player.width/2) {
                    if ('rotationSpeed' in item) { // Asteroid
                        if (!isPhased) {
                            createExplosion(player.x, player.y, '239, 68, 68');
                            setGameState('gameOver');
                        }
                    } else if ('type' in item) { // PowerUp
                        if (item.type === 'phase') {
                            gameObjects.current.isPhased = true;
                            gameObjects.current.phaseTimer = 300; // 5 seconds
                        } else {
                            gameObjects.current.hasLaser = true;
                        }
                        // FIX: Add type assertion to resolve TypeScript error when finding item in array.
                        powerUps.splice(powerUps.indexOf(item as PowerUp), 1);
                    } else { // Collectible
                        setScore(s => s + 50);
                        createExplosion(item.x, item.y, '52, 211, 153');
                        // FIX: Add type assertion to resolve TypeScript error when finding item in array.
                        collectibles.splice(collectibles.indexOf(item as Collectible), 1);
                    }
                }
            });

            // Update particles
            gameObjects.current.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; p.alpha = p.life / 40; });
            gameObjects.current.particles = gameObjects.current.particles.filter(p => p.life > 0);
        }

        draw(ctx, canvas);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setGameState('playing');
        setScore(0);
        startTimeRef.current = Date.now();
        gameObjects.current = {
            player: { x: canvas.width / 2, y: canvas.height - 80, width: 40, height: 50 },
            asteroids: [], collectibles: [], powerUps: [], particles: [], lasers: [],
            isPhased: false, phaseTimer: 0, hasLaser: false, stars: gameObjects.current.stars
        };
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) draw(ctx, canvas);
        gameObjects.current.stars = Array.from({ length: 150 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, z: Math.random() * 0.8 + 0.2 }));

        const handleMouseMove = (e: MouseEvent) => {
            if (gameState !== 'playing') return;
            const rect = canvas.getBoundingClientRect();
            gameObjects.current.player.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        };
        const handleMouseClick = () => {
            if (gameState === 'playing' && gameObjects.current.hasLaser) {
                gameObjects.current.lasers.push({ x: gameObjects.current.player.x, y: gameObjects.current.player.y, width: 4, height: 20 });
                gameObjects.current.hasLaser = false;
            } else if (gameState !== 'playing') {
                startGame();
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleMouseClick);
        animationFrameId.current = requestAnimationFrame(gameLoop);
        
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleMouseClick);
        };
    }, [gameState]);

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <h3 className="text-xl font-bold mb-4 text-center">Mission: Asteroid Belt Navigator</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">Pilot your ship through the dangerous asteroid belt. Collect Helium-3 and grab power-ups to survive longer!</p>
            <div className={`aspect-video w-full rounded-lg overflow-hidden bg-stone-900 ${gameState === 'playing' ? 'cursor-none' : 'cursor-pointer'}`}>
                 <canvas ref={canvasRef} width={800} height={450} className="w-full h-full" />
            </div>
        </div>
    );
};

export default AsteroidBeltNavigator;