
import React, { useRef, useEffect, useState } from 'react';

interface ParkerSolarProbeGameProps {
    addAchievement: (id: string) => void;
}

// Interfaces
interface Probe { x: number; y: number; targetX: number; targetY: number; width: number; height: number; trail: {x:number, y:number}[] }
interface Flare { x: number; y: number; radius: number; speed: number; }
interface DataPacket { x: number; y: number; radius: number; speed: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; }

const ParkerSolarProbeGame: React.FC<ParkerSolarProbeGameProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [score, setScore] = useState(0);
    const [heat, setHeat] = useState(0);

    const gameObjects = useRef<{
        probe: Probe;
        flares: Flare[];
        dataPackets: DataPacket[];
        particles: Particle[];
    }>({
        probe: { x: 400, y: 400, targetX: 400, targetY: 400, width: 30, height: 50, trail: [] },
        flares: [],
        dataPackets: [],
        particles: [],
    });
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        if (score >= 1000) {
            addAchievement('sun-grazer');
        }
    }, [score, addAchievement]);

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sun Corona
        const sunY = -150;
        const sunRadius = 200;
        for (let i = 0; i < 5; i++) {
            const grad = ctx.createRadialGradient(canvas.width / 2, sunY, 0, canvas.width / 2, sunY, sunRadius + Math.sin(Date.now() / 500 + i) * 30);
            grad.addColorStop(0, `rgba(255, 220, 150, ${0.1 + Math.sin(Date.now() / 700 + i) * 0.05})`);
            grad.addColorStop(0.8, `rgba(255, 180, 100, ${0.05 + Math.sin(Date.now() / 600 + i) * 0.03})`);
            grad.addColorStop(1, 'rgba(255,165,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, sunY, sunRadius + 50, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cooling Zones
        ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.fillRect(0, 0, 100, canvas.height);
        ctx.fillRect(canvas.width - 100, 0, 100, canvas.height);

        const { probe } = gameObjects.current;

        // Probe Trail
        probe.trail.forEach((p, i) => {
            const alpha = (i / probe.trail.length) * 0.5;
            ctx.fillStyle = `rgba(103, 232, 249, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y + probe.height/2, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Probe
        ctx.fillStyle = '#c0c0c0';
        ctx.beginPath();
        ctx.moveTo(probe.x, probe.y); ctx.lineTo(probe.x - probe.width / 2, probe.y + probe.height);
        ctx.lineTo(probe.x + probe.width / 2, probe.y + probe.height); ctx.closePath(); ctx.fill();
        
        // Heat shield
        const heatRatio = heat / 100;
        const shieldColor = `rgb(255, ${200 - heatRatio * 150}, ${50 - heatRatio * 50})`;
        ctx.fillStyle = shieldColor;
        ctx.shadowBlur = 20 * heatRatio;
        ctx.shadowColor = shieldColor;
        ctx.fillRect(probe.x - probe.width / 2, probe.y - 10, probe.width, 10);
        ctx.shadowBlur = 0;

        // Flares
        gameObjects.current.flares.forEach(flare => {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(flare.x, flare.y, flare.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Data Packets
        gameObjects.current.dataPackets.forEach(packet => {
            ctx.fillStyle = '#67e8f9';
            ctx.fillRect(packet.x - 5, packet.y - 5, 10, 10);
        });

        // Particles
        gameObjects.current.particles.forEach(p => {
             ctx.fillStyle = `rgba(103, 232, 249, ${p.life / 20})`;
             ctx.beginPath();
             ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
             ctx.fill();
        });

        // UI
        ctx.fillStyle = 'white'; ctx.font = '20px Orbitron';
        ctx.fillText(`Score: ${Math.floor(score)}`, 10, 25);
        ctx.fillText(`Heat:`, canvas.width - 170, 25);
        ctx.fillStyle = '#4b5563'; ctx.fillRect(canvas.width - 170, 35, 160, 20);
        const heatBarColor = heat < 60 ? '#fde047' : heat < 90 ? '#f59e0b' : '#ef4444';
        ctx.fillStyle = heatBarColor;
        ctx.fillRect(canvas.width - 170, 35, 160 * heatRatio, 20);
        ctx.fillStyle = 'white'; ctx.font = '12px Orbitron'; ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(heat)}%`, canvas.width - 90, 49);
        ctx.textAlign = 'left';

        if (gameState !== 'playing') {
             ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = 'white'; ctx.textAlign = 'center';
             if (gameState === 'gameOver') {
                ctx.font = '40px Orbitron'; ctx.fillText('PROBE OVERHEATED', canvas.width / 2, canvas.height / 2 - 40);
                ctx.font = '20px Orbitron'; ctx.fillText(`Final Score: ${Math.floor(score)}`, canvas.width / 2, canvas.height / 2);
                ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 40);
             } else {
                ctx.font = '40px Orbitron'; ctx.fillText('Parker Solar Probe', canvas.width / 2, canvas.height / 2 - 40);
                ctx.font = '20px Orbitron';
                ctx.fillText('Fly close to the sun to collect data, but avoid overheating!', canvas.width / 2, canvas.height / 2);
                ctx.fillText('Use cooling zones on the sides to manage heat.', canvas.width / 2, canvas.height/2 + 30);
                ctx.fillText('Click to begin', canvas.width / 2, canvas.height / 2 + 70);
             }
             ctx.textAlign = 'left';
        }
    };
    
    const gameLoop = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if(gameState === 'playing') {
            const { probe, flares, dataPackets } = gameObjects.current;

            probe.x += (probe.targetX - probe.x) * 0.1;
            probe.y += (probe.targetY - probe.y) * 0.1;

            probe.trail.push({x: probe.x, y: probe.y});
            if(probe.trail.length > 20) probe.trail.shift();

            const proximity = (canvas.height - probe.y) / canvas.height;
            setScore(s => s + proximity * 0.5);
            setHeat(h => Math.min(100, h + proximity * 0.1));

            // Cooling
            if(probe.x < 100 || probe.x > canvas.width - 100) {
                setHeat(h => Math.max(0, h - 0.25));
            }

            if (Math.random() < 0.05) flares.push({ x: Math.random() * canvas.width, y: 0, radius: Math.random() * 10 + 5, speed: Math.random() * 2 + 2 });
            if (Math.random() < 0.02) dataPackets.push({ x: Math.random() * canvas.width, y: 0, radius: 8, speed: 3 });
            
            const updateAndFilter = (items: (Flare | DataPacket)[], onCollide: () => void) => {
                return items.filter(item => {
                    item.y += item.speed;
                    const hit = Math.hypot(item.x - probe.x, item.y - (probe.y + probe.height/2)) < probe.width / 2 + item.radius;
                    if (hit) onCollide();
                    return item.y < canvas.height && !hit;
                });
            }

            gameObjects.current.flares = updateAndFilter(flares, () => setHeat(h => Math.min(100, h + 15))) as Flare[];
            gameObjects.current.dataPackets = updateAndFilter(dataPackets, () => {
                setScore(s => s + 100);
                for(let i=0; i<15; i++) {
                    gameObjects.current.particles.push({
                        x: probe.x, y: probe.y,
                        vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3,
                        life: 20
                    });
                }
            }) as DataPacket[];

            gameObjects.current.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; });
            gameObjects.current.particles = gameObjects.current.particles.filter(p => p.life > 0);

            if (heat >= 100) setGameState('gameOver');
        }

        draw(ctx, canvas);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
        setGameState('playing'); setScore(0); setHeat(0);
        gameObjects.current.flares = []; gameObjects.current.dataPackets = []; gameObjects.current.particles = [];
        const canvas = canvasRef.current;
        if(canvas) {
            gameObjects.current.probe.targetX = canvas.width / 2;
            gameObjects.current.probe.targetY = canvas.height - 80;
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (ctx) draw(ctx, canvas);
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            gameObjects.current.probe.targetX = e.clientX - rect.left;
            gameObjects.current.probe.targetY = e.clientY - rect.top;
        };

        const handleCanvasClick = () => { if (gameState !== 'playing') startGame(); }
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleCanvasClick);
        animationFrameId.current = requestAnimationFrame(gameLoop);
        
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleCanvasClick);
        };
    }, [gameState]);

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <h3 className="text-xl font-bold mb-4 text-center">Mission: Parker Solar Probe</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">Pilot the probe close to the sun to gather data, but avoid solar flares and manage your heat. Use the blue zones on the sides to cool down!</p>
            <div className={`aspect-video w-full rounded-lg overflow-hidden bg-stone-900 ${gameState === 'playing' ? 'cursor-none' : 'cursor-pointer'}`}>
                 <canvas ref={canvasRef} width={800} height={450} className="w-full h-full" />
            </div>
        </div>
    );
};

export default ParkerSolarProbeGame;
