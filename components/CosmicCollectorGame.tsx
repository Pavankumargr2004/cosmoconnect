
import React, { useRef, useEffect, useState } from 'react';

interface CosmicCollectorGameProps {
    addAchievement: (id: string) => void;
}

// Game object interfaces
interface Player { x: number; y: number; width: number; height: number; targetX: number; targetY: number; }
interface FallingObject { id: number; x: number; y: number; radius: number; speed: number; type: 'star' | 'junk' | 'shield' | 'magnet'; rotation: number; }
interface Particle { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; life: number; color: string; }
interface Star { x: number; y: number; z: number; }

const CosmicCollectorGame: React.FC<CosmicCollectorGameProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(100);
    const [isHit, setIsHit] = useState(false);

    const gameObjects = useRef<{
        player: Player;
        items: FallingObject[];
        particles: Particle[];
        stars: Star[];
        isShielded: boolean;
        shieldTimer: number;
        isMagnetActive: boolean;
        magnetTimer: number;
    }>({
        player: { x: 400, y: 400, width: 50, height: 60, targetX: 400, targetY: 400 },
        items: [],
        particles: [],
        stars: [],
        isShielded: false,
        shieldTimer: 0,
        isMagnetActive: false,
        magnetTimer: 0,
    });

    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        if (score >= 200) {
            addAchievement('star-fragment-hoarder');
        }
    }, [score, addAchievement]);

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw parallax stars
        gameObjects.current.stars.forEach(star => {
            const sx = star.x;
            const sy = (star.y + (Date.now() * 0.01 * star.z)) % canvas.height;
            const alpha = 0.5 + star.z * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(sx, sy, star.z * 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        const { player, isShielded } = gameObjects.current;

        // Draw thruster
        if (gameState === 'playing') {
            const thrusterY = player.y + player.height - 15;
            const thrusterWidth = player.width * 0.3 + Math.random() * (player.width * 0.2);
            const thrusterGradient = ctx.createLinearGradient(player.x - thrusterWidth / 2, thrusterY, player.x + thrusterWidth / 2, thrusterY);
            thrusterGradient.addColorStop(0, 'rgba(255, 220, 180, 0)');
            thrusterGradient.addColorStop(0.5, 'rgba(255, 180, 100, 0.8)');
            thrusterGradient.addColorStop(1, 'rgba(255, 220, 180, 0)');
            ctx.fillStyle = thrusterGradient;
            ctx.fillRect(player.x - thrusterWidth / 2, thrusterY, thrusterWidth, 30 + Math.random() * 10);
        }

        // Draw player ship
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x - player.width / 2, player.y + player.height);
        ctx.lineTo(player.x + player.width / 2, player.y + player.height);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.arc(player.x, player.y + 15, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw shield
        if (isShielded) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(player.x, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }

        gameObjects.current.items.forEach(item => {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation);
            ctx.shadowBlur = 10;
            switch (item.type) {
                case 'star':
                    ctx.fillStyle = '#facc15'; ctx.shadowColor = '#facc15';
                    ctx.beginPath(); ctx.arc(0, 0, item.radius, 0, Math.PI * 2); ctx.fill();
                    break;
                case 'junk':
                    ctx.fillStyle = '#9ca3af'; ctx.shadowColor = 'black';
                    ctx.fillRect(-item.radius, -item.radius, item.radius * 2, item.radius * 2);
                    break;
                case 'shield':
                    ctx.fillStyle = '#38bdf8'; ctx.shadowColor = '#38bdf8';
                    ctx.beginPath(); ctx.arc(0, 0, item.radius, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = 'white'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('S', 0, 1);
                    break;
                case 'magnet':
                    ctx.fillStyle = '#a78bfa'; ctx.shadowColor = '#a78bfa';
                    ctx.beginPath(); ctx.arc(0, 0, item.radius, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = 'white'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('M', 0, 1);
                    break;
            }
            ctx.restore();
        });
        
        ctx.shadowBlur = 0;
        gameObjects.current.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            ctx.fill();
        });

        // UI
        ctx.fillStyle = 'white'; ctx.font = '20px Orbitron';
        ctx.fillText(`Score: ${score}`, 10, 25);
        ctx.fillText(`Health:`, canvas.width - 200, 25);
        ctx.fillStyle = '#4b5563'; ctx.fillRect(canvas.width - 120, 10, 110, 20);
        const healthColor = health < 30 ? '#ef4444' : health < 60 ? '#f59e0b' : '#22c55e';
        ctx.fillStyle = healthColor;
        ctx.fillRect(canvas.width - 120, 10, 110 * (health / 100), 20);

        if (isHit) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (gameState !== 'playing') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white'; ctx.textAlign = 'center';
            if (gameState === 'gameOver') {
                ctx.font = '40px Orbitron'; ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
                ctx.font = '20px Orbitron'; ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
                ctx.fillText('Click to play again', canvas.width / 2, canvas.height / 2 + 40);
            } else {
                ctx.font = '40px Orbitron'; ctx.fillText('Cosmic Collector', canvas.width / 2, canvas.height / 2 - 40);
                ctx.font = '20px Orbitron'; ctx.fillText('Use your mouse to catch star fragments!', canvas.width / 2, canvas.height / 2);
                ctx.fillText('Click to begin', canvas.width / 2, canvas.height / 2 + 40);
            }
            ctx.textAlign = 'left';
        }
    };

    const createParticles = (x: number, y: number, color: string) => {
        for (let i = 0; i < 20; i++) {
            gameObjects.current.particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, radius: Math.random() * 2 + 1, alpha: 1, life: 30, color });
        }
    };

    const gameLoop = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (gameState === 'playing') {
            const { player, isMagnetActive, shieldTimer, magnetTimer } = gameObjects.current;

            player.x += (player.targetX - player.x) * 0.2;
            player.y += (player.targetY - player.y) * 0.2;

            if (shieldTimer > 0) gameObjects.current.shieldTimer--; else gameObjects.current.isShielded = false;
            if (magnetTimer > 0) gameObjects.current.magnetTimer--; else gameObjects.current.isMagnetActive = false;

            if (Math.random() < 0.05) {
                const type = Math.random() < 0.05 ? 'shield' : Math.random() < 0.1 ? 'magnet' : Math.random() < 0.7 ? 'star' : 'junk';
                const difficultyFactor = 1 + score / 500;
                gameObjects.current.items.push({ id: Date.now() + Math.random(), x: Math.random() * canvas.width, y: -20, radius: type === 'star' ? 12 : 15, speed: (Math.random() * 2 + 1.5) * difficultyFactor, type, rotation: 0 });
            }
            
            const remainingItems: FallingObject[] = [];
            gameObjects.current.items.forEach(item => {
                if (isMagnetActive && item.type === 'star') {
                    const dx = player.x - item.x;
                    const dy = player.y - item.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 150) {
                        item.x += dx / dist * 5;
                        item.y += dy / dist * 5;
                    }
                }
                item.y += item.speed;
                if(item.type === 'junk') item.rotation += 0.05;

                const playerBox = { x: player.x - player.width / 2, y: player.y, width: player.width, height: player.height };
                const closestX = Math.max(playerBox.x, Math.min(item.x, playerBox.x + playerBox.width));
                const closestY = Math.max(playerBox.y, Math.min(item.y, playerBox.y + playerBox.height));
                const distance = Math.hypot(item.x - closestX, item.y - closestY);

                if (distance < item.radius) {
                    switch (item.type) {
                        case 'star': setScore(s => s + 10); createParticles(item.x, item.y, '250, 204, 21'); break;
                        case 'junk':
                            if (gameObjects.current.isShielded) {
                                gameObjects.current.isShielded = false;
                                createParticles(item.x, item.y, '56, 189, 248');
                            } else {
                                setHealth(h => Math.max(0, h - 20));
                                setIsHit(true);
                                setTimeout(() => setIsHit(false), 100);
                            }
                            break;
                        case 'shield': gameObjects.current.isShielded = true; gameObjects.current.shieldTimer = 300; break;
                        case 'magnet': gameObjects.current.isMagnetActive = true; gameObjects.current.magnetTimer = 300; break;
                    }
                } else if (item.y < canvas.height + 20) {
                    remainingItems.push(item);
                }
            });
            gameObjects.current.items = remainingItems;

            gameObjects.current.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; p.alpha = p.life / 30; });
            gameObjects.current.particles = gameObjects.current.particles.filter(p => p.life > 0);

            if (health <= 0) setGameState('gameOver');
        }

        draw(ctx, canvas);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
        const canvas = canvasRef.current; if (!canvas) return;
        gameObjects.current.player.targetY = canvas.height - 80;
        setGameState('playing'); setScore(0); setHealth(100);
        gameObjects.current.items = []; gameObjects.current.particles = [];
    };

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (ctx) draw(ctx, canvas);
        gameObjects.current.stars = Array.from({ length: 100 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, z: Math.random() * 0.5 + 0.1 }));

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            gameObjects.current.player.targetX = (e.clientX - rect.left) * scaleX;
            gameObjects.current.player.targetY = (e.clientY - rect.top) * scaleY;
        };

        const handleCanvasClick = () => { if (gameState !== 'playing') startGame(); };
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
            <h3 className="text-xl font-bold mb-4 text-center">Mission: Cosmic Collector</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">Pilot your starship and catch glowing star fragments! Avoid the dangerous space junk. Look out for power-ups!</p>
            <div className={`aspect-video w-full rounded-lg overflow-hidden bg-stone-900 ${gameState === 'playing' ? 'cursor-none' : 'cursor-pointer'}`}>
                 <canvas ref={canvasRef} width={800} height={450} className="w-full h-full" />
            </div>
        </div>
    );
};

export default CosmicCollectorGame;
