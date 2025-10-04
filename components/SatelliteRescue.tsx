import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SatelliteRescueProps {
    addAchievement: (id: string) => void;
}

// Interfaces
interface Satellite { id: number; x: number; y: number; angle: number; isDamaged: boolean; isFixed: boolean; }
interface Drone { x: number; y: number; targetId: number | null; speed: number; }

// Mini-game tile interfaces
interface Tile { type: 'start' | 'end' | 'path' | 'empty'; rotation: number; connects: number[]; } // connects: [top, right, bottom, left]

// Generate a solvable puzzle
const generatePuzzle = (size: number): Tile[][] => {
    const grid: Tile[][] = Array.from({ length: size }, () => Array(size).fill(0).map(() => ({ type: 'empty', rotation: 0, connects: [0,0,0,0] })));
    let path: {x: number, y: number}[] = [];
    
    // Simple maze generation (random walk)
    let x = 0, y = Math.floor(Math.random() * size);
    grid[y][x] = { type: 'start', rotation: 0, connects: [0,1,0,0] };
    path.push({x, y});

    while(x < size - 1) {
        const last = path[path.length - 1];
        let moves = [];
        if(x + 1 < size && !path.find(p => p.x === x + 1 && p.y === y)) moves.push({x: 1, y: 0}); // Right
        if(y + 1 < size && !path.find(p => p.x === x && p.y === y + 1)) moves.push({x: 0, y: 1}); // Down
        if(y - 1 >= 0 && !path.find(p => p.x === x && p.y === y - 1)) moves.push({x: 0, y: -1}); // Up

        if(moves.length === 0) { // Stuck, backtrack
           path.pop();
           if(path.length === 0) return generatePuzzle(size); // Should not happen, but as a fallback
           const prev = path[path.length - 1];
           x = prev.x;
           y = prev.y;
           continue;
        }
        
        const move = moves[Math.floor(Math.random() * moves.length)];
        x += move.x;
        y += move.y;
        path.push({x, y});
    }
    
    grid[y][x] = { type: 'end', rotation: 0, connects: [0,0,0,1] };
    
    // Create tiles from path
    for (let i = 1; i < path.length - 1; i++) {
        const prev = path[i-1];
        const curr = path[i];
        const next = path[i+1];
        
        const fromTop = prev.y === curr.y - 1;
        const fromRight = prev.x === curr.x + 1;
        const fromBottom = prev.y === curr.y + 1;
        const fromLeft = prev.x === curr.x - 1;

        const toTop = next.y === curr.y - 1;
        const toRight = next.x === curr.x + 1;
        const toBottom = next.y === curr.y + 1;
        const toLeft = next.x === curr.x - 1;

        const connects = [
            fromTop || toTop ? 1 : 0,
            fromRight || toRight ? 1 : 0,
            fromBottom || toBottom ? 1 : 0,
            fromLeft || toLeft ? 1 : 0
        ];
        
        grid[curr.y][curr.x] = { type: 'path', rotation: 0, connects: connects as number[] };
    }

    // Scramble rotations and add dummy tiles
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if(grid[r][c].type === 'empty') {
                 grid[r][c] = { type: 'path', rotation: Math.floor(Math.random()*4) * 90, connects: Math.random() > 0.5 ? [1,0,1,0] : [0,1,0,1] };
            } else {
                 grid[r][c].rotation = Math.floor(Math.random() * 4) * 90;
            }
        }
    }
    return grid;
};


const SatelliteRescue: React.FC<SatelliteRescueProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'miniGame' | 'win' | 'lose'>('start');
    const [timeLeft, setTimeLeft] = useState(120);
    const [repairedCount, setRepairedCount] = useState(0);
    const [puzzle, setPuzzle] = useState<Tile[][]>([]);

    const gameObjects = useRef<{
        drone: Drone;
        satellites: Satellite[];
    }>({
        drone: { x: 400, y: 300, targetId: null, speed: 4 },
        satellites: [],
    });

    const animationFrameId = useRef<number | null>(null);
    const timerId = useRef<number | null>(null);

    // Achievement logic
    useEffect(() => {
        if (repairedCount >= 3) {
            addAchievement('satellite-savior');
        }
    }, [repairedCount, addAchievement]);
    
    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Background
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Earth in center
        ctx.fillStyle = '#4682B4';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
        ctx.fill();

        // Satellites
        gameObjects.current.satellites.forEach(sat => {
            ctx.save();
            ctx.translate(sat.x, sat.y);
            ctx.fillStyle = sat.isFixed ? '#22c55e' : (sat.isDamaged ? '#ef4444' : '#9ca3af');
            if (sat.isDamaged) { // Pulsing effect for damaged satellites
                ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 200) * 0.3;
            }
            ctx.fillRect(-10, -10, 20, 20);
            ctx.restore();
        });
        
        // Drone
        const { drone } = gameObjects.current;
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(drone.x, drone.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // UI
        ctx.fillStyle = 'white';
        ctx.font = '20px Orbitron';
        ctx.fillText(`Repaired: ${repairedCount}/${gameObjects.current.satellites.filter(s=>s.isDamaged || s.isFixed).length}`, 10, 25);
        ctx.fillText(`Time Left: ${timeLeft}s`, canvas.width - 180, 25);

        if (gameState !== 'playing' && gameState !== 'miniGame') {
             ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = 'white';
             ctx.textAlign = 'center';
             ctx.font = '40px Orbitron';
             if (gameState === 'win') ctx.fillText('MISSION COMPLETE!', canvas.width / 2, canvas.height / 2 - 20);
             if (gameState === 'lose') ctx.fillText('MISSION FAILED', canvas.width / 2, canvas.height / 2 - 20);
             if (gameState === 'start') ctx.fillText('Satellite Rescue', canvas.width / 2, canvas.height / 2 - 40);

             ctx.font = '20px Orbitron';
             if (gameState === 'win') ctx.fillText(`You saved the network with ${timeLeft}s to spare!`, canvas.width / 2, canvas.height / 2 + 20);
             if (gameState === 'lose') ctx.fillText(`Final count: ${repairedCount} repaired. The network is down.`, canvas.width / 2, canvas.height / 2 + 20);
             if (gameState === 'start') ctx.fillText('Click on damaged satellites to repair them!', canvas.width / 2, canvas.height / 2);
             
             ctx.fillText('Click to start', canvas.width / 2, canvas.height / 2 + 60);
             ctx.textAlign = 'left';
        }
    };
    
    const gameLoop = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const { drone, satellites } = gameObjects.current;

        // Move drone
        if (drone.targetId !== null) {
            const targetSat = satellites.find(s => s.id === drone.targetId);
            if (targetSat) {
                const dx = targetSat.x - drone.x;
                const dy = targetSat.y - drone.y;
                const dist = Math.hypot(dx, dy);
                if (dist < drone.speed) {
                    drone.x = targetSat.x;
                    drone.y = targetSat.y;
                    if(targetSat.isDamaged) {
                        setPuzzle(generatePuzzle(4));
                        setGameState('miniGame');
                    }
                    drone.targetId = null;
                } else {
                    drone.x += (dx / dist) * drone.speed;
                    drone.y += (dy / dist) * drone.speed;
                }
            }
        }
        
        draw(ctx, canvas);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const numSatellites = 6;
        const orbitRadius = Math.min(canvas.width, canvas.height) / 2 - 50;
        const newSatellites = Array.from({ length: numSatellites }).map((_, i) => {
            const angle = (i / numSatellites) * Math.PI * 2;
            return {
                id: i,
                x: canvas.width / 2 + Math.cos(angle) * orbitRadius,
                y: canvas.height / 2 + Math.sin(angle) * orbitRadius,
                angle,
                isDamaged: true,
                isFixed: false,
            };
        });
        
        gameObjects.current.satellites = newSatellites;
        gameObjects.current.drone.x = canvas.width / 2;
        gameObjects.current.drone.y = canvas.height / 2;
        gameObjects.current.drone.targetId = null;

        setRepairedCount(0);
        setTimeLeft(120);
        setGameState('playing');

        if (timerId.current) clearInterval(timerId.current);
        timerId.current = window.setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameState('lose');
                    clearInterval(timerId.current!);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };
    
    const checkPuzzleWin = (currentPuzzle: Tile[][]) => {
        const size = currentPuzzle.length;
        const visited = Array.from({length: size}, () => Array(size).fill(false));
        const queue: {x: number, y: number}[] = [];
        
        let startPos = {x: -1, y: -1};
        for(let r=0; r<size; r++) {
            if (currentPuzzle[r][0].type === 'start') {
                startPos = {x: 0, y: r};
                break;
            }
        }
        if (startPos.x === -1) return false;

        queue.push(startPos);
        visited[startPos.y][startPos.x] = true;

        while(queue.length > 0) {
            const {x, y} = queue.shift()!;
            const tile = currentPuzzle[y][x];

            if(tile.type === 'end' && x === size - 1) return true;

            const r = tile.rotation * (Math.PI / 180);
            const rotatedConnects = tile.connects.map((_, i) => {
                const newIndex = Math.round(i - (r / (Math.PI/2)))
                return tile.connects[(newIndex + 4) % 4]
            })

            // Check neighbors
            // Top
            if (rotatedConnects[0] && y > 0 && !visited[y - 1][x] && currentPuzzle[y - 1][x].connects[2]) queue.push({x, y: y-1});
            // Right
            if (rotatedConnects[1] && x < size - 1 && !visited[y][x + 1] && currentPuzzle[y][x + 1].connects[3]) queue.push({x: x+1, y});
            // Bottom
            if (rotatedConnects[2] && y < size - 1 && !visited[y + 1][x] && currentPuzzle[y + 1][x].connects[0]) queue.push({x, y: y+1});
            // Left
            if (rotatedConnects[3] && x > 0 && !visited[y][x - 1] && currentPuzzle[y][x - 1].connects[1]) queue.push({x: x-1, y});
        }
        return false;
    }


    const handleTileClick = (row: number, col: number) => {
        const newPuzzle = puzzle.map(r => r.map(c => ({...c})));
        const tile = newPuzzle[row][col];
        if (tile.type !== 'start' && tile.type !== 'end') {
            tile.rotation = (tile.rotation + 90) % 360;
            setPuzzle(newPuzzle);
            
            // Check for win condition
            if(checkPuzzleWin(newPuzzle)) {
                 const targetId = gameObjects.current.drone.targetId;
                 const newSatellites = gameObjects.current.satellites.map(s => {
                     if (s.id === targetId) return {...s, isDamaged: false, isFixed: true};
                     return s;
                 });
                 gameObjects.current.satellites = newSatellites;
                 const newRepairedCount = repairedCount + 1;
                 setRepairedCount(newRepairedCount);
                 setGameState('playing');
                 
                 if (newRepairedCount === gameObjects.current.satellites.filter(s=>s.isDamaged || s.isFixed).length) {
                     setGameState('win');
                     if (timerId.current) clearInterval(timerId.current);
                 }
            }
        }
    };


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const handleCanvasClick = (e: MouseEvent) => {
             if (gameState === 'start' || gameState === 'win' || gameState === 'lose') {
                startGame();
             } else if (gameState === 'playing') {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                gameObjects.current.satellites.forEach(sat => {
                    if (Math.hypot(mouseX - sat.x, mouseY - sat.y) < 20 && sat.isDamaged) {
                        gameObjects.current.drone.targetId = sat.id;
                    }
                });
             }
        }
        
        canvas.addEventListener('click', handleCanvasClick);
        if (gameState === 'start') {
            const ctx = canvas.getContext('2d');
            if (ctx) draw(ctx, canvas);
        }
        
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            if (timerId.current) clearInterval(timerId.current);
            canvas.removeEventListener('click', handleCanvasClick);
        };
    }, [gameState]);


    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30 relative">
            <h3 className="text-xl font-bold mb-4 text-center">Mission: Satellite Rescue</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">A solar flare is coming! Repair all damaged satellites (red) before time runs out. Click a satellite to travel to it.</p>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-stone-900 cursor-pointer">
                 <canvas
                    ref={canvasRef}
                    width={800}
                    height={450}
                    className="w-full h-full"
                />
            </div>

            <AnimatePresence>
            {gameState === 'miniGame' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center"
                >
                    <div className="bg-gray-900/80 border-2 border-sky-400 p-6 rounded-2xl shadow-2xl shadow-sky-500/30">
                        <h4 className="text-xl font-bold text-center text-sky-300 mb-4">Re-route Power!</h4>
                        <div className="grid grid-cols-4 gap-1 bg-gray-800 p-2 rounded-md">
                            {puzzle.map((row, rIdx) => row.map((tile, cIdx) => (
                                <div key={`${rIdx}-${cIdx}`} onClick={() => handleTileClick(rIdx, cIdx)} className="w-16 h-16 flex items-center justify-center cursor-pointer">
                                    <motion.div
                                        className="w-full h-full"
                                        animate={{ rotate: tile.rotation }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                       {/* Tile SVG drawing would go here */}
                                    </motion.div>
                                </div>
                            )))}
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default SatelliteRescue;