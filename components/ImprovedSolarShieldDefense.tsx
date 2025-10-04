import React, { useRef, useEffect, useState } from 'react';

interface ImprovedSolarShieldDefenseProps {
    addAchievement: (id: string) => void;
}

interface Flare {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    type: 'normal' | 'mega' | 'splitter';
    life: number;
}

const ImprovedSolarShieldDefense: React.FC<ImprovedSolarShieldDefenseProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'playing' | 'gameOver' | 'start'>('start');
    const [score, setScore] = useState(0);
    const [earthHealth, setEarthHealth] = useState(100);
    const [shieldPower, setShieldPower] = useState(100);
    const [level, setLevel] = useState(1);

    const gameObjects = useRef<{
        shield: { angle: number; radius: number; width: number; };
        flares: Flare[];
        stars: any[];
        earth: { x: number; y: number; radius: number; };
        sun: { x: number; y: number; radius: number; };
        particles: any[];
    }>({
        shield: { angle: 0, radius: 70, width: Math.PI / 1.5 },
        flares: [],
        stars: [],
        earth: { x: 0, y: 0, radius: 45 },
        sun: { x: 0, y: 0, radius: 90 },
        particles: []
    });
    
    const animationFrameId = useRef<number | null>(null);
    const lastFlareTime = useRef<number>(0);
    const flareInterval = useRef<number>(1500);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        if (score >= 30) {
            addAchievement('planetary-protector');
        }
    }, [score, addAchievement]);

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Space background with gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#0f172a');
        bgGradient.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars
        ctx.fillStyle = 'white';
        gameObjects.current.stars.forEach((star: any) => {
            ctx.globalAlpha = star.alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Sun with corona effect
        const sun = gameObjects.current.sun;
        const coronaGradient = ctx.createRadialGradient(
            sun.x, sun.y, sun.radius,
            sun.x, sun.y, sun.radius + 30
        );
        coronaGradient.addColorStop(0, 'rgba(255, 165, 0, 0.8)');
        coronaGradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
        ctx.fillStyle = coronaGradient;
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, sun.radius + 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Sun core
        const sunGradient = ctx.createRadialGradient(
            sun.x, sun.y, 0,
            sun.x, sun.y, sun.radius
        );
        sunGradient.addColorStop(0, '#FFD700');
        sunGradient.addColorStop(1, '#FF8C00');
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
        ctx.fill();

        // Earth with atmospheric glow
        const earth = gameObjects.current.earth;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#60a5fa';
        ctx.fillStyle = '#4682B4';
        ctx.beginPath();
        ctx.arc(earth.x, earth.y, earth.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Continents (simplified)
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(earth.x - 10, earth.y - 10, 8, 0, Math.PI * 2);
        ctx.arc(earth.x + 15, earth.y + 5, 10, 0, Math.PI * 2);
        ctx.fill();

        // Shield with power indicator
        const shield = gameObjects.current.shield;
        const shieldColor = shieldPower > 50 ? '#67e8f9' : (shieldPower > 20 ? '#fbbf24' : '#f87171');
        
        // Shield glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = shieldColor;
        ctx.strokeStyle = shieldColor;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(
            earth.x, 
            earth.y, 
            shield.radius, 
            shield.angle - shield.width / 2, 
            shield.angle + shield.width / 2
        );
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Shield energy particles
        if (gameState === 'playing') {
            for (let i = 0; i < 5; i++) {
                const angle = shield.angle - shield.width / 2 + Math.random() * shield.width;
                const x = earth.x + Math.cos(angle) * shield.radius;
                const y = earth.y + Math.sin(angle) * shield.radius;
                
                ctx.fillStyle = shieldColor;
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        // Flares with different types
        gameObjects.current.flares.forEach((flare: Flare) => {
            let color = '#f59e0b';
            if (flare.type === 'mega') color = '#ef4444';
            if (flare.type === 'splitter') color = '#8b5cf6';
            
            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(flare.x, flare.y, flare.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Pulsing effect for mega flares
            if (flare.type === 'mega') {
                const pulse = Math.sin(Date.now() / 100) * 0.3 + 1;
                ctx.beginPath();
                ctx.arc(flare.x, flare.y, flare.radius * pulse, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        // Particles
        gameObjects.current.particles.forEach((p: any) => {
            ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI
        ctx.fillStyle = 'white';
        ctx.font = '20px Orbitron';
        ctx.fillText(`Flares Blocked: ${score}`, 10, 25);
        ctx.fillText(`Level: ${level}`, canvas.width / 2 - 50, 25);
        ctx.fillText(`Shield: ${Math.max(0, Math.round(shieldPower))}%`, canvas.width - 200, 25);
        ctx.fillText(`Health: ${Math.max(0, Math.round(earthHealth))}%`, canvas.width - 200, 50);
        
        // Power bar
        ctx.fillStyle = '#334155';
        ctx.fillRect(10, canvas.height - 30, 200, 20);
        ctx.fillStyle = shieldPower > 50 ? '#22c55e' : (shieldPower > 20 ? '#f59e0b' : '#ef4444');
        ctx.fillRect(10, canvas.height - 30, 200 * (shieldPower / 100), 20);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, canvas.height - 30, 200, 20);
        
        // Game Over or Start Screen
        if (gameState !== 'playing') {
             ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = 'white';
             ctx.textAlign = 'center';
             if (gameState === 'gameOver') {
                ctx.font = '40px Orbitron';
                ctx.fillText('SOLAR STORM OVERWHELMED EARTH', canvas.width / 2, canvas.height / 2 - 60);
                ctx.font = '24px Orbitron';
                ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = '20px Orbitron';
                ctx.fillText(`Level Reached: ${level}`, canvas.width / 2, canvas.height / 2 + 10);
                ctx.fillText('Click to defend again', canvas.width / 2, canvas.height / 2 + 50);
             } else { // 'start'
                ctx.font = '40px Orbitron';
                ctx.fillText('Solar Shield Defense', canvas.width / 2, canvas.height / 2 - 80);
                ctx.font = '20px Orbitron';
                ctx.fillText('Protect Earth from solar flares using your shield!', canvas.width / 2, canvas.height / 2 - 40);
                ctx.fillText('Move your mouse to aim the shield', canvas.width / 2, canvas.height / 2 - 10);
                ctx.fillText('Flares deplete shield power - let them hit Earth and you lose health!', canvas.width / 2, canvas.height / 2 + 20);
                ctx.fillText('Shield regenerates when not hit', canvas.width / 2, canvas.height / 2 + 50);
                ctx.fillText('Click to begin', canvas.width / 2, canvas.height / 2 + 90);
             }
             ctx.textAlign = 'left';
        }
    };
    
    const createParticles = (x: number, y: number, color: string, count: number) => {
        for (let i = 0; i < count; i++) {
            gameObjects.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: Math.random() * 3 + 1,
                alpha: 1,
                life: 30,
                color
            });
        }
    };
    
    const gameLoop = (timestamp: number) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;
        
        // Spawn new flares based on level
        if (gameState === 'playing' && timestamp - lastFlareTime.current > flareInterval.current) {
            lastFlareTime.current = timestamp;
            
            // Determine flare type based on level
            let type: 'normal' | 'mega' | 'splitter' = 'normal';
            const rand = Math.random();
            if (level >= 3 && rand < 0.15) type = 'mega'; // 15% chance for mega flare at level 3+
            else if (level >= 2 && rand < 0.1) type = 'splitter'; // 10% chance for splitter at level 2+
            
            // Create flare
            const angle = (Math.random() - 0.5) * (Math.PI / 2) + Math.PI; // Aim towards Earth
            const speed = (Math.random() * 1.5 + 1.5) * (1 + level * 0.2);
            const radius = type === 'mega' ? 15 : (type === 'splitter' ? 8 : 10);
            
            gameObjects.current.flares.push({
                x: gameObjects.current.sun.x,
                y: gameObjects.current.sun.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius,
                type,
                life: 600 // Frames until automatic removal
            });
            
            // Increase difficulty with level
            flareInterval.current = Math.max(300, 1500 - (level * 100));
        }

        const { shield, flares, earth, particles } = gameObjects.current;
        
        // Update and check collisions for flares
        const remainingFlares: Flare[] = [];
        flares.forEach((flare: Flare) => {
            flare.x += flare.vx * (deltaTime / 16);
            flare.y += flare.vy * (deltaTime / 16);
            flare.life--;
            
            // Splitter flares split into smaller flares when near Earth
            if (flare.type === 'splitter' && flare.life < 500 && Math.random() < 0.02) {
                for (let i = 0; i < 3; i++) {
                    remainingFlares.push({
                        x: flare.x,
                        y: flare.y,
                        vx: (Math.random() - 0.5) * 3,
                        vy: (Math.random() - 0.5) * 3,
                        radius: 5,
                        type: 'normal',
                        life: 300
                    });
                }
                createParticles(flare.x, flare.y, '#8b5cf6', 15);
                return; // Remove the splitter flare
            }

            const distToEarth = Math.hypot(flare.x - earth.x, flare.y - earth.y);
            let collided = false;
            let shieldHit = false;

            // Shield collision - more accurate angle checking
            if (distToEarth < shield.radius + flare.radius && distToEarth > shield.radius - flare.radius) {
                const flareAngle = (Math.atan2(flare.y - earth.y, flare.x - earth.x) + Math.PI * 2) % (Math.PI * 2);
                let shieldStart = (shield.angle - shield.width / 2 + Math.PI * 2) % (Math.PI * 2);
                let shieldEnd = (shield.angle + shield.width / 2 + Math.PI * 2) % (Math.PI * 2);

                // Handle wrap-around
                if (shieldStart > shieldEnd) {
                    if (flareAngle >= shieldStart || flareAngle <= shieldEnd) {
                        collided = true;
                        shieldHit = true;
                    }
                } else {
                    if (flareAngle >= shieldStart && flareAngle <= shieldEnd) {
                        collided = true;
                        shieldHit = true;
                    }
                }
                
                if (shieldHit) {
                    // Block the flare
                    setScore(s => s + (flare.type === 'mega' ? 3 : flare.type === 'splitter' ? 2 : 1));
                    createParticles(flare.x, flare.y, '#67e8f9', 20);
                    
                    // Shield power drain based on flare type
                    const powerDrain = flare.type === 'mega' ? 15 : (flare.type === 'splitter' ? 8 : 5);
                    setShieldPower(p => Math.max(0, p - powerDrain));
                }
            }
            
            // Earth collision
            if (distToEarth < earth.radius + flare.radius) {
                setEarthHealth(h => {
                    const newHealth = h - (flare.type === 'mega' ? 15 : flare.type === 'splitter' ? 8 : 5);
                    if (newHealth <= 0) {
                        setGameState('gameOver');
                    }
                    return Math.max(0, newHealth);
                });
                createParticles(flare.x, flare.y, '#ef4444', 25);
                collided = true;
            }

            // Keep flare if it's still on screen and hasn't collided or expired
            if (!collided && flare.life > 0 && 
                flare.x < canvas.width + flare.radius && 
                flare.x > -flare.radius &&
                flare.y < canvas.height + flare.radius && 
                flare.y > -flare.radius) {
                remainingFlares.push(flare);
            }
        });
        gameObjects.current.flares = remainingFlares;
        
        // Update particles
        gameObjects.current.particles = particles.filter((p: any) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha = p.life / 30;
            return p.life > 0;
        });
        
        // Regenerate shield power slowly when not being hit
        if (gameState === 'playing' && shieldPower < 100) {
            setShieldPower(p => Math.min(100, p + 0.1 * (deltaTime / 16)));
        }
        
        // Level progression
        const newLevel = Math.floor(score / 10) + 1;
        if (newLevel > level) {
            setLevel(newLevel);
        }

        draw(ctx, canvas);
        if (gameState === 'playing') {
             animationFrameId.current = requestAnimationFrame(gameLoop);
        }
    };
    
    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setEarthHealth(100);
        setShieldPower(100);
        setLevel(1);
        lastFlareTime.current = 0;
        flareInterval.current = 1500;
        gameObjects.current.flares = [];
        gameObjects.current.particles = [];
        
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        lastTimeRef.current = performance.now();
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Initialize static positions
        const { earth, sun } = gameObjects.current;
        earth.x = canvas.width * 0.8;
        earth.y = canvas.height / 2;
        sun.x = canvas.width * 0.1;
        sun.y = canvas.height / 2;

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
        
        const ctx = canvas.getContext('2d');
        if (ctx) draw(ctx, canvas); // initial draw for start screen

        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current || gameState !== 'playing') return;
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const earthPos = gameObjects.current.earth;
            gameObjects.current.shield.angle = Math.atan2(mouseY - earthPos.y, mouseX - earthPos.x);
        };

        const handleCanvasClick = () => {
             if (gameState !== 'playing') {
                startGame();
            }
        }
        
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleCanvasClick);
        
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleCanvasClick);
        };
    }, []);

    useEffect(() => {
        if (gameState === 'gameOver' && animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            const canvas = canvasRef.current;
            if(!canvas) return;
            const ctx = canvas.getContext('2d');
            if(ctx) draw(ctx, canvas); // one last draw call to show game over screen
        }
    }, [gameState]);

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <h3 className="text-xl font-bold mb-4 text-center">Mission: Solar Shield Defense</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">A massive solar storm is heading for Earth! Use your mouse to aim the planetary shield and deflect the dangerous solar flares. Don't let the shield integrity drop to 0%!</p>
            <div className={`aspect-video w-full rounded-lg overflow-hidden bg-stone-900 ${gameState === 'playing' ? 'cursor-none' : 'cursor-pointer'}`}>
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

export default ImprovedSolarShieldDefense;