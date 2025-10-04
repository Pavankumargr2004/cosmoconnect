import React, { useRef, useEffect, useState } from 'react';

interface ImprovedCosmicCollectorProps {
    addAchievement: (id: string) => void;
}

// Game object interfaces
interface Player { x: number; y: number; width: number; height: number; }
interface FallingObject { x: number; y: number; radius: number; speed: number; type: 'star' | 'junk'; }
interface Particle { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; life: number; }

const ImprovedCosmicCollector: React.FC<ImprovedCosmicCollectorProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(100);

    const gameObjects = useRef<{
        player: Player;
        items: FallingObject[];
        particles: Particle[];
    }>({
        player: { x: 400, y: 400, width: 60, height: 40 },
        items: [],
        particles: [],
    });

    const animationFrameId = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Achievement logic
    useEffect(() => {
        // Achievement for collecting 20 star fragments (200 points)
        if (score >= 200) {
            addAchievement('star-fragment-hoarder');
        }
    }, [score, addAchievement]);

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        // Clear canvas
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars in background
        ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % canvas.width;
            const y = (i * 73) % canvas.height;
            const size = Math.sin(i) * 0.5 + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw player ship (a simple triangle with a cockpit)
        const { player } = gameObjects.current;
        ctx.fillStyle = '#e5e7eb'; // light gray
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x - player.width / 2, player.y + player.height);
        ctx.lineTo(player.x + player.width / 2, player.y + player.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#67e8f9'; // cyan cockpit
        ctx.beginPath();
        ctx.arc(player.x, player.y + 15, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw engine glow
        if (gameState === 'playing') {
            const gradient = ctx.createRadialGradient(
                player.x, player.y + player.height + 5,
                0,
                player.x, player.y + player.height + 5,
                15
            );
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(player.x, player.y + player.height + 5, 15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw falling items
        gameObjects.current.items.forEach(item => {
            if (item.type === 'star') {
                ctx.fillStyle = '#facc15'; // yellow
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#facc15';
            } else { // junk
                ctx.fillStyle = '#9ca3af'; // gray
                ctx.shadowBlur = 5;
                ctx.shadowColor = '#9ca3af';
            }
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw particles
        gameObjects.current.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
            ctx.fillStyle = `rgba(250, 204, 21, ${p.alpha})`;
            ctx.fill();
        });

        // Draw UI
        ctx.fillStyle = 'white';
        ctx.font = '20px Orbitron';
        ctx.fillText(`Score: ${score}`, 10, 25);
        ctx.fillText(`Health: ${health}%`, canvas.width - 150, 25);

        // Draw start/game over screen
        if (gameState !== 'playing') {
             ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = 'white';
             ctx.textAlign = 'center';
             if (gameState === 'gameOver') {
                ctx.font = '40px Orbitron';
                ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
                ctx.font = '20px Orbitron';
                ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
                ctx.fillText('Click to play again', canvas.width / 2, canvas.height / 2 + 40);
             } else { // 'start'
                ctx.font = '40px Orbitron';
                ctx.fillText('Cosmic Collector', canvas.width / 2, canvas.height / 2 - 40);
                ctx.font = '20px Orbitron';
                ctx.fillText('Use your mouse to catch star fragments!', canvas.width / 2, canvas.height / 2);
                ctx.fillText('Avoid space junk or lose health!', canvas.width / 2, canvas.height / 2 + 25);
                ctx.fillText('Click to begin', canvas.width / 2, canvas.height / 2 + 60);
             }
             ctx.textAlign = 'left';
        }
    };

    const createParticles = (x: number, y: number) => {
        for (let i = 0; i < 15; i++) {
            gameObjects.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                radius: Math.random() * 3 + 1,
                alpha: 1,
                life: 40
            });
        }
    }

    const gameLoop = (timestamp: number) => {
        if (!canvasRef.current || gameState !== 'playing') return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;
        
        // Spawn items at a consistent rate regardless of frame rate
        if (Math.random() < 0.03) { // Spawn rate
            const type = Math.random() < 0.7 ? 'star' : 'junk'; // 70% stars, 30% junk
            const difficultyFactor = 1 + score / 1000; // speed increases with score
            gameObjects.current.items.push({
                x: Math.random() * (canvas.width - 40) + 20,
                y: -20,
                radius: type === 'star' ? 10 : 15,
                speed: (Math.random() * 2 + 1.5) * difficultyFactor,
                type: type,
            });
        }
        
        // Update items
        const { player, items } = gameObjects.current;
        const remainingItems: FallingObject[] = [];

        items.forEach(item => {
            item.y += item.speed * (deltaTime / 16); // Adjust for frame rate

            // Better collision detection using bounding box
            const playerLeft = player.x - player.width / 2;
            const playerRight = player.x + player.width / 2;
            const playerTop = player.y;
            const playerBottom = player.y + player.height;

            const itemLeft = item.x - item.radius;
            const itemRight = item.x + item.radius;
            const itemTop = item.y - item.radius;
            const itemBottom = item.y + item.radius;

            const collision = (
                itemRight > playerLeft &&
                itemLeft < playerRight &&
                itemBottom > playerTop &&
                itemTop < playerBottom
            );

            if (collision) {
                if (item.type === 'star') {
                    setScore(s => s + 10);
                    createParticles(item.x, item.y);
                } else {
                    setHealth(h => Math.max(0, h - 15));
                }
            } else if (item.y < canvas.height + 50) {
                remainingItems.push(item);
            }
        });
        gameObjects.current.items = remainingItems;

        // Update particles
        gameObjects.current.particles = gameObjects.current.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha = p.life / 40;
            return p.life > 0;
        });

        // Check for game over
        if (health <= 0) {
            setGameState('gameOver');
        }

        draw(ctx, canvas);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Set player position based on canvas size
        gameObjects.current.player.y = canvas.height - 60;
        
        setGameState('playing');
        setScore(0);
        setHealth(100);
        gameObjects.current.items = [];
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
        
        const ctx = canvas.getContext('2d');
        if (ctx) draw(ctx, canvas);

        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current || gameState !== 'playing') return;
            const rect = canvasRef.current.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const mouseXInCanvas = (e.clientX - rect.left) * scaleX;
            
            // Keep player within canvas bounds
            gameObjects.current.player.x = Math.max(
                gameObjects.current.player.width / 2,
                Math.min(canvas.width - gameObjects.current.player.width / 2, mouseXInCanvas)
            );
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
    }, [gameState]);

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <h3 className="text-xl font-bold mb-4 text-center">Mission: Cosmic Collector</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">Pilot your starship and catch glowing star fragments! Avoid the dangerous space junk that will damage your ship. How high can you score?</p>
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

export default ImprovedCosmicCollector;