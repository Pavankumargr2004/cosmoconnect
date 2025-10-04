import React, { useRef, useEffect, useState } from 'react';

interface SolarShieldDefenseProps {
    addAchievement: (id: string) => void;
}

const SolarShieldDefense: React.FC<SolarShieldDefenseProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'playing' | 'gameOver' | 'start'>('start');
    const [score, setScore] = useState(0); // number of blocks
    const [earthHealth, setEarthHealth] = useState(100);

    const gameObjects = useRef<any>({
        shield: { angle: 0, radius: 60, width: Math.PI / 2 },
        flares: [],
        stars: [],
        earth: { x: 0, y: 0, radius: 40 },
        sun: { x: 0, y: 0, radius: 80 }
    });
    const animationFrameId = useRef<number | null>(null);
    const lastFlareTime = useRef<number>(0);
    const flareInterval = useRef<number>(2000); // Start with 2s interval

    useEffect(() => {
        if (score >= 20) {
            addAchievement('planetary-protector');
        }
    }, [score, addAchievement]);

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Background
        ctx.fillStyle = '#0a0a2a';
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

        // Sun
        const sun = gameObjects.current.sun;
        const sunGradient = ctx.createRadialGradient(sun.x, sun.y, sun.radius * 0.5, sun.x, sun.y, sun.radius);
        sunGradient.addColorStop(0, '#FFD700');
        sunGradient.addColorStop(1, 'rgba(255,165,0,0)');
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
        ctx.fill();

        // Earth
        const earth = gameObjects.current.earth;
        ctx.fillStyle = '#4682B4';
        ctx.beginPath();
        ctx.arc(earth.x, earth.y, earth.radius, 0, Math.PI * 2);
        ctx.fill();

        // Shield
        const shield = gameObjects.current.shield;
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(earth.x, earth.y, shield.radius, shield.angle - shield.width / 2, shield.angle + shield.width / 2);
        ctx.stroke();

        // Flares
        gameObjects.current.flares.forEach((flare: any) => {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(flare.x, flare.y, flare.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI
        ctx.fillStyle = 'white';
        ctx.font = '20px Orbitron';
        ctx.fillText(`Flares Blocked: ${score}`, 10, 25);
        ctx.fillText(`Shield Integrity: ${Math.max(0, Math.round(earthHealth))}%`, canvas.width - 280, 25);
        
        // Game Over or Start Screen
        if (gameState !== 'playing') {
             ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = 'white';
             ctx.textAlign = 'center';
             if (gameState === 'gameOver') {
                ctx.font = '40px Orbitron';
                ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
                ctx.font = '20px Orbitron';
                ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
                ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 40);
             } else { // 'start'
                ctx.font = '40px Orbitron';
                ctx.fillText('Solar Shield Defense', canvas.width / 2, canvas.height / 2 - 40);
                ctx.font = '20px Orbitron';
                ctx.fillText('Use your mouse to aim the shield and protect Earth!', canvas.width / 2, canvas.height / 2);
                ctx.fillText('Click to begin', canvas.width / 2, canvas.height / 2 + 40);
             }
             ctx.textAlign = 'left';
        }
    };
    
    const gameLoop = (timestamp: number) => {
        if (!canvasRef.current || earthHealth <= 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Spawn new flares
        if (gameState === 'playing' && timestamp - lastFlareTime.current > flareInterval.current) {
            lastFlareTime.current = timestamp;
            const angle = (Math.random() - 0.5) * (Math.PI / 3) + Math.PI; // Aim towards Earth
            const speed = Math.random() * 2 + 2;
            gameObjects.current.flares.push({
                x: gameObjects.current.sun.x,
                y: gameObjects.current.sun.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 5 + 5
            });
            // Increase difficulty
            flareInterval.current = Math.max(500, flareInterval.current * 0.99);
        }

        const { shield, flares, earth } = gameObjects.current;
        
        // Update and check collisions for flares
        const remainingFlares: any[] = [];
        flares.forEach((flare: any) => {
            flare.x += flare.vx;
            flare.y += flare.vy;

            const distToEarth = Math.hypot(flare.x - earth.x, flare.y - earth.y);
            let collided = false;

            // Shield collision
            if (distToEarth < shield.radius + 5 && distToEarth > shield.radius - 5) {
                const flareAngle = Math.atan2(flare.y - earth.y, flare.x - earth.x);
                let shieldStart = shield.angle - shield.width / 2;
                let shieldEnd = shield.angle + shield.width / 2;

                // Normalize angles to handle wrap-around from -PI to PI
                const normalize = (a: number) => (a + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
                const normFlareAngle = normalize(flareAngle);
                const normShieldStart = normalize(shieldStart);
                const normShieldEnd = normalize(shieldEnd);

                if (normShieldStart > normShieldEnd) { // Shield crosses the -PI/PI boundary
                    if (normFlareAngle >= normShieldStart || normFlareAngle <= normShieldEnd) {
                        collided = true;
                    }
                } else {
                    if (normFlareAngle >= normShieldStart && normFlareAngle <= normShieldEnd) {
                        collided = true;
                    }
                }
                
                if (collided) {
                    setScore(s => s + 1);
                }
            }
            
            // Earth collision
            if (distToEarth < earth.radius) {
                setEarthHealth(h => h - 10);
                collided = true;
            }

            // Keep flare if it's still on screen and hasn't collided
            if (!collided && flare.x < canvas.width + flare.radius && flare.x > -flare.radius) {
                remainingFlares.push(flare);
            }
        });
        gameObjects.current.flares = remainingFlares;
        
        if (earthHealth <= 0) {
            setEarthHealth(0); // Clamp health at 0
            setGameState('gameOver');
        }

        draw(ctx, canvas);
        if (gameState === 'playing' && earthHealth > 0) {
             animationFrameId.current = requestAnimationFrame(gameLoop);
        }
    };
    
    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setEarthHealth(100);
        lastFlareTime.current = 0;
        flareInterval.current = 2000;
        gameObjects.current.flares = [];
        
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
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
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.2,
                alpha: Math.random() * 0.5 + 0.3,
            });
        }
        gameObjects.current.stars = stars;
        
        const ctx = canvas.getContext('2d');
        if (ctx) draw(ctx, canvas); // initial draw for start screen

        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

     useEffect(() => {
        if (gameState === 'gameOver' && animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            const canvas = canvasRef.current;
            if(!canvas) return;
            const ctx = canvas.getContext('2d');
            if(ctx) draw(ctx, canvas); // one last draw call to show game over screen
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export default SolarShieldDefense;