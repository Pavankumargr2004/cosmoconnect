import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Interfaces for simulation objects
interface Particle { x: number; y: number; vx: number; vy: number; life: number; type: 'cme' | 'aurora'; }
interface MagnetospherePoint { x: number; y: number; originalX: number; originalY: number; }

const CMEImpactSimulator: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cmeSpeed, setCmeSpeed] = useState(3);
    const [cmeDensity, setCmeDensity] = useState(5);
    const [isSimulating, setIsSimulating] = useState(false);
    const particlesRef = useRef<Particle[]>([]);
    const magnetosphereRef = useRef<MagnetospherePoint[]>([]);
    const animationFrameId = useRef<number | null>(null);

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Background
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const sunPos = { x: 80, y: canvas.height / 2 };
        const planetPos = { x: canvas.width - 150, y: canvas.height / 2 };
        const planetRadius = 40;

        // Draw Sun
        const sunGradient = ctx.createRadialGradient(sunPos.x, sunPos.y, 10, sunPos.x, sunPos.y, 40);
        sunGradient.addColorStop(0, '#FFD700');
        sunGradient.addColorStop(1, 'rgba(255,165,0,0)');
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sunPos.x, sunPos.y, 40, 0, Math.PI * 2);
        ctx.fill();

        // Draw Planet
        ctx.fillStyle = '#4682B4';
        ctx.beginPath();
        ctx.arc(planetPos.x, planetPos.y, planetRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw Magnetosphere
        ctx.strokeStyle = 'rgba(103, 232, 249, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        magnetosphereRef.current.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Draw Particles
        particlesRef.current.forEach(p => {
            if (p.type === 'cme') {
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            } else { // aurora
                 const auroraGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.life * 0.3);
                 auroraGradient.addColorStop(0, `rgba(50, 255, 150, ${p.life / 50 * 0.8})`);
                 auroraGradient.addColorStop(1, `rgba(50, 255, 150, 0)`);
                 ctx.fillStyle = auroraGradient;
                 ctx.fillRect(p.x - p.life * 0.3, p.y - p.life * 0.3, p.life * 0.6, p.life * 0.6);
            }
        });
    };

    const simLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const planetPos = { x: canvas.width - 150, y: canvas.height / 2 };
        const planetRadius = 40;

        // Update magnetosphere (return to original shape)
        magnetosphereRef.current.forEach(p => {
            p.x += (p.originalX - p.x) * 0.1;
            p.y += (p.originalY - p.y) * 0.1;
        });

        const newParticles: Particle[] = [];
        particlesRef.current.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            if (p.life > 0) {
                if (p.type === 'cme') {
                    let inMagnetosphere = false;
                    // Simplified collision and interaction
                    magnetosphereRef.current.forEach(mp => {
                        const dist = Math.hypot(p.x - mp.x, p.y - mp.y);
                        if (dist < 30) {
                           inMagnetosphere = true;
                           mp.x -= p.vx * 0.5; // Push the magnetosphere
                        }
                    });

                    if (inMagnetosphere) {
                        const angleToPole = Math.atan2(p.y - planetPos.y, p.x - planetPos.x);
                        p.vx = Math.cos(angleToPole + Math.PI / 2) * cmeSpeed * 0.5;
                        p.vy = Math.sin(angleToPole + Math.PI / 2) * cmeSpeed * 0.5;
                        
                        // Check if it hits atmosphere at poles
                        const distToPlanet = Math.hypot(p.x - planetPos.x, p.y - planetPos.y);
                        if (distToPlanet < planetRadius + 10 && Math.abs(p.y - planetPos.y) > planetRadius * 0.7) {
                            for(let i=0; i<3; i++) {
                                newParticles.push({
                                    x: p.x, y: p.y, vx: 0, vy: 0, life: 50, type: 'aurora'
                                });
                            }
                            p.life = 0; // CME particle is absorbed
                        }
                    }
                }
                if (p.life > 0) newParticles.push(p);
            }
        });
        particlesRef.current = newParticles;

        draw(ctx, canvas);
        animationFrameId.current = requestAnimationFrame(simLoop);
    };

    const handleLaunch = () => {
        setIsSimulating(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const sunPos = { x: 80, y: canvas.height / 2 };

        for (let i = 0; i < cmeDensity * 20; i++) {
            setTimeout(() => {
                const angle = (Math.random() - 0.5) * 0.8;
                particlesRef.current.push({
                    x: sunPos.x,
                    y: sunPos.y,
                    vx: Math.cos(angle) * cmeSpeed,
                    vy: Math.sin(angle) * cmeSpeed,
                    life: 300,
                    type: 'cme'
                });
            }, i * (100 / cmeDensity)); // Stagger particle launch
        }
    };
    
    // Initialize simulation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const planetPos = { x: canvas.width - 150, y: canvas.height / 2 };

        // Create magnetosphere shape
        magnetosphereRef.current = [];
        const magnetosphereRadius = 120;
        const points = 50;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points - 0.5) * Math.PI * 1.5;
            const x = planetPos.x - Math.cos(angle) * magnetosphereRadius;
            const y = planetPos.y - Math.sin(angle) * magnetosphereRadius * 1.8;
            magnetosphereRef.current.push({ x, y, originalX: x, originalY: y });
        }
        
        simLoop();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <h3 className="text-xl font-bold mb-2 text-center">CME Impact Simulator</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">Configure and launch a solar storm! Watch how it interacts with a planet's magnetic shield to create auroras.</p>

            <div className="flex flex-col lg:flex-row gap-4 h-[70vh] max-h-[500px]">
                <div className="flex-shrink-0 lg:w-56 bg-gray-900/50 p-4 rounded-lg border border-violet-700/30 flex flex-col gap-6">
                    <div>
                        <label className="font-bold text-violet-300" htmlFor="cmeSpeed">CME Speed ({cmeSpeed})</label>
                        <input
                            type="range" id="cmeSpeed" min="1" max="10" value={cmeSpeed}
                            onChange={e => setCmeSpeed(Number(e.target.value))}
                            className="w-full mt-2"
                        />
                    </div>
                     <div>
                        <label className="font-bold text-violet-300" htmlFor="cmeDensity">CME Density ({cmeDensity})</label>
                        <input
                            type="range" id="cmeDensity" min="1" max="10" value={cmeDensity}
                            onChange={e => setCmeDensity(Number(e.target.value))}
                            className="w-full mt-2"
                        />
                    </div>
                    <motion.button 
                        onClick={handleLaunch} 
                        className="mt-auto px-4 py-3 bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold rounded-full shadow-lg hover:shadow-red-500/50 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Launch CME!
                    </motion.button>
                     <p className="text-xs text-violet-400 text-center">A stronger CME will create a more dramatic aurora!</p>
                </div>
                <div className="flex-grow w-full h-64 lg:h-full rounded-lg overflow-hidden bg-black border border-violet-700/30">
                    <canvas ref={canvasRef} width={800} height={450} className="w-full h-full" />
                </div>
            </div>
        </div>
    );
};

export default CMEImpactSimulator;
