import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImprovedSatelliteRescueProps {
    addAchievement: (id: string) => void;
}

// Interfaces
interface Satellite { 
    id: number; 
    x: number; 
    y: number; 
    angle: number; 
    isDamaged: boolean; 
    isFixed: boolean; 
    type: 'communication' | 'weather' | 'gps' | 'science';
}

interface Drone { 
    x: number; 
    y: number; 
    targetId: number | null; 
    speed: number; 
    repairing: boolean;
}

// Puzzle tile interfaces
interface Tile { 
    type: 'start' | 'end' | 'path' | 'corner' | 't-junction' | 'cross'; 
    rotation: number; 
    connects: boolean[]; // [top, right, bottom, left]
}

const SAT_TYPES = [
    { name: 'Communication', color: '#60a5fa' },
    { name: 'Weather', color: '#34d399' },
    { name: 'GPS', color: '#fbbf24' },
    { name: 'Science', color: '#a78bfa' }
];

// Generate a solvable puzzle with proper tile connections
const generatePuzzle = (size: number): Tile[][] => {
    // Create an empty grid
    const grid: Tile[][] = Array(size).fill(null).map(() => 
        Array(size).fill(null).map(() => ({
            type: 'path',
            rotation: 0,
            connects: [false, false, false, false]
        }))
    );
    
    // Create a path from left to right
    const path: {x: number, y: number}[] = [];
    let x = 0;
    let y = Math.floor(Math.random() * (size - 2)) + 1; // Not on edges
    
    // Start tile
    grid[y][x] = { 
        type: 'start', 
        rotation: 0, 
        connects: [false, true, false, false] // Connects right
    };
    path.push({x, y});
    
    // Generate path to the right side
    while (x < size - 1) {
        // Possible moves: right, up, down
        const moves = [];
        if (x < size - 1) moves.push({dx: 1, dy: 0}); // Right
        if (y > 0) moves.push({dx: 0, dy: -1}); // Up
        if (y < size - 1) moves.push({dx: 0, dy: 1}); // Down
        
        // Prefer moving right
        let move;
        if (x < size - 3 && Math.random() < 0.7) {
            move = {dx: 1, dy: 0};
        } else {
            move = moves[Math.floor(Math.random() * moves.length)];
        }
        
        x += move.dx;
        y += move.dy;
        
        // Make sure we don't go backwards
        if (!path.find(p => p.x === x && p.y === y)) {
            path.push({x, y});
        } else {
            // If we would go to an existing position, backtrack
            path.pop();
            if (path.length > 0) {
                x = path[path.length - 1].x;
                y = path[path.length - 1].y;
            }
            continue;
        }
    }
    
    // End tile
    grid[y][x] = { 
        type: 'end', 
        rotation: 0, 
        connects: [false, false, false, true] // Connects left
    };
    
    // Set connections for path tiles
    for (let i = 0; i < path.length; i++) {
        const {x, y} = path[i];
        const tile = grid[y][x];
        
        // Determine connections
        tile.connects = [false, false, false, false];
        
        // Check previous tile
        if (i > 0) {
            const prev = path[i - 1];
            if (prev.x < x) tile.connects[3] = true; // Left
            if (prev.x > x) tile.connects[1] = true; // Right
            if (prev.y < y) tile.connects[0] = true; // Top
            if (prev.y > y) tile.connects[2] = true; // Bottom
        }
        
        // Check next tile
        if (i < path.length - 1) {
            const next = path[i + 1];
            if (next.x > x) tile.connects[1] = true; // Right
            if (next.x < x) tile.connects[3] = true; // Left
            if (next.y > y) tile.connects[2] = true; // Bottom
            if (next.y < y) tile.connects[0] = true; // Top
        }
        
        // Determine tile type based on connections
        const connections = tile.connects.filter(c => c).length;
        if (connections === 2) {
            // Straight or corner
            const [top, right, bottom, left] = tile.connects;
            if ((top && bottom) || (left && right)) {
                tile.type = 'path'; // Straight
            } else {
                tile.type = 'corner'; // Corner
            }
        } else if (connections === 3) {
            tile.type = 't-junction';
        } else if (connections === 4) {
            tile.type = 'cross';
        }
    }
    
    // Randomly rotate all tiles
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            grid[y][x].rotation = Math.floor(Math.random() * 4) * 90;
        }
    }
    
    return grid;
};

// Draw tile on canvas
const drawTile = (ctx: CanvasRenderingContext2D, tile: Tile, x: number, y: number, size: number) => {
    ctx.save();
    ctx.translate(x + size/2, y + size/2);
    ctx.rotate(tile.rotation * Math.PI / 180);
    
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Draw based on tile type
    switch(tile.type) {
        case 'start':
        case 'end':
            // Circle for start/end
            ctx.beginPath();
            ctx.arc(0, 0, size/3, 0, Math.PI * 2);
            ctx.stroke();
            break;
            
        case 'path':
            // Straight line
            const [top, right, bottom, left] = tile.connects;
            if ((top && bottom) || !left && !right) {
                // Vertical line
                ctx.beginPath();
                ctx.moveTo(0, -size/2);
                ctx.lineTo(0, size/2);
                ctx.stroke();
            } else {
                // Horizontal line
                ctx.beginPath();
                ctx.moveTo(-size/2, 0);
                ctx.lineTo(size/2, 0);
                ctx.stroke();
            }
            break;
            
        case 'corner':
            // Corner piece
            ctx.beginPath();
            if (tile.connects[0] && tile.connects[1]) { // Top-right
                ctx.moveTo(0, -size/2);
                ctx.lineTo(0, 0);
                ctx.lineTo(size/2, 0);
            } else if (tile.connects[1] && tile.connects[2]) { // Right-bottom
                ctx.moveTo(size/2, 0);
                ctx.lineTo(0, 0);
                ctx.lineTo(0, size/2);
            } else if (tile.connects[2] && tile.connects[3]) { // Bottom-left
                ctx.moveTo(0, size/2);
                ctx.lineTo(0, 0);
                ctx.lineTo(-size/2, 0);
            } else { // Left-top
                ctx.moveTo(-size/2, 0);
                ctx.lineTo(0, 0);
                ctx.lineTo(0, -size/2);
            }
            ctx.stroke();
            break;
            
        case 't-junction':
            // T-junction
            ctx.beginPath();
            if (!tile.connects[0]) { // No top - draw bottom, left, right
                ctx.moveTo(-size/2, 0);
                ctx.lineTo(size/2, 0);
                ctx.moveTo(0, 0);
                ctx.lineTo(0, size/2);
            } else if (!tile.connects[1]) { // No right - draw top, left, bottom
                ctx.moveTo(-size/2, 0);
                ctx.lineTo(0, 0);
                ctx.lineTo(0, -size/2);
                ctx.moveTo(0, 0);
                ctx.lineTo(0, size/2);
            } else if (!tile.connects[2]) { // No bottom - draw top, left, right
                ctx.moveTo(-size/2, 0);
                ctx.lineTo(size/2, 0);
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -size/2);
            } else { // No left - draw top, right, bottom
                ctx.moveTo(0, -size/2);
                ctx.lineTo(0, size/2);
                ctx.moveTo(0, 0);
                ctx.lineTo(size/2, 0);
            }
            ctx.stroke();
            break;
            
        case 'cross':
            // Cross
            ctx.beginPath();
            ctx.moveTo(-size/2, 0);
            ctx.lineTo(size/2, 0);
            ctx.moveTo(0, -size/2);
            ctx.lineTo(0, size/2);
            ctx.stroke();
            break;
    }
    
    ctx.restore();
};

const ImprovedSatelliteRescue: React.FC<ImprovedSatelliteRescueProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'miniGame' | 'win' | 'lose'>('start');
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const [repairedCount, setRepairedCount] = useState(0);
    const [puzzle, setPuzzle] = useState<Tile[][]>([]);
    const [targetSatellite, setTargetSatellite] = useState<Satellite | null>(null);
    const [level, setLevel] = useState(1);

    const gameObjects = useRef<{
        drone: Drone;
        satellites: Satellite[];
    }>({
        drone: { x: 400, y: 300, targetId: null, speed: 4, repairing: false },
        satellites: [],
    });

    const animationFrameId = useRef<number | null>(null);
    const timerId = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Achievement logic
    useEffect(() => {
        if (repairedCount >= 5) {
            addAchievement('satellite-savior');
        }
    }, [repairedCount, addAchievement]);
    
    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Space background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Stars
        ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % canvas.width;
            const y = (i * 73) % canvas.height;
            const size = Math.sin(i) * 0.5 + 1;
            ctx.globalAlpha = 0.7 + Math.sin(i * 0.1 + Date.now() / 1000) * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Earth in center with glow
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#60a5fa';
        ctx.fillStyle = '#4682B4';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 90, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Continents
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 20, canvas.height / 2 - 20, 15, 0, Math.PI * 2);
        ctx.arc(canvas.width / 2 + 30, canvas.height / 2 + 10, 20, 0, Math.PI * 2);
        ctx.fill();

        // Orbit paths
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        const orbitRadius = Math.min(canvas.width, canvas.height) / 2 - 70;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Satellites
        gameObjects.current.satellites.forEach(sat => {
            ctx.save();
            ctx.translate(sat.x, sat.y);
            
            // Satellite type color
            const satType = SAT_TYPES.find((_, i) => i === 
                (sat.type === 'communication' ? 0 : 
                 sat.type === 'weather' ? 1 : 
                 sat.type === 'gps' ? 2 : 3));
            const color = satType ? satType.color : '#9ca3af';
            
            // Pulsing effect for damaged satellites
            if (sat.isDamaged) {
                const pulse = Math.sin(Date.now() / 200) * 0.3 + 1;
                ctx.scale(pulse, pulse);
            }
            
            // Satellite body
            ctx.fillStyle = sat.isFixed ? '#22c55e' : (sat.isDamaged ? '#ef4444' : color);
            ctx.fillRect(-12, -12, 24, 24);
            
            // Solar panels
            ctx.fillStyle = sat.isFixed ? '#4ade80' : (sat.isDamaged ? '#f87171' : '#94a3b8');
            ctx.fillRect(-25, -5, 10, 10);
            ctx.fillRect(15, -5, 10, 10);
            
            // Antenna for communication satellites
            if (sat.type === 'communication') {
                ctx.strokeStyle = sat.isFixed ? '#4ade80' : (sat.isDamaged ? '#f87171' : '#94a3b8');
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -12);
                ctx.lineTo(0, -25);
                ctx.stroke();
            }
            
            // Sensor for weather satellites
            if (sat.type === 'weather') {
                ctx.fillStyle = sat.isFixed ? '#4ade80' : (sat.isDamaged ? '#f87171' : '#94a3b8');
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Name label
            ctx.fillStyle = 'white';
            ctx.font = '10px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(satType?.name || '', 0, 25);
            ctx.textAlign = 'left';
            
            ctx.restore();
        });
        
        // Drone with repair animation
        const { drone } = gameObjects.current;
        ctx.save();
        ctx.translate(drone.x, drone.y);
        
        // Drone body
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Drone direction indicator
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(5, 0);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();
        
        // Repair beam when repairing
        if (drone.repairing) {
            const beamHeight = 30 + Math.sin(Date.now() / 100) * 5;
            const gradient = ctx.createLinearGradient(0, 0, 0, beamHeight);
            gradient.addColorStop(0, 'rgba(253, 224, 71, 0.8)');
            gradient.addColorStop(1, 'rgba(253, 224, 71, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(-2, 0, 4, beamHeight);
        }
        
        ctx.restore();

        // UI
        ctx.fillStyle = 'white';
        ctx.font = '20px Orbitron';
        ctx.fillText(`Repaired: ${repairedCount}/${gameObjects.current.satellites.filter(s=>s.isDamaged || s.isFixed).length}`, 10, 25);
        ctx.fillText(`Level: ${level}`, canvas.width / 2 - 40, 25);
        ctx.fillText(`Time: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`, canvas.width - 150, 25);

        if (gameState !== 'playing' && gameState !== 'miniGame') {
             ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = 'white';
             ctx.textAlign = 'center';
             ctx.font = '40px Orbitron';
             if (gameState === 'win') {
                 ctx.fillText('SATELLITE NETWORK RESTORED!', canvas.width / 2, canvas.height / 2 - 60);
                 ctx.font = '24px Orbitron';
                 ctx.fillText(`All satellites repaired with ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} remaining!`, canvas.width / 2, canvas.height / 2 - 20);
                 ctx.font = '20px Orbitron';
                 ctx.fillText(`Level reached: ${level}`, canvas.width / 2, canvas.height / 2 + 10);
             }
             if (gameState === 'lose') {
                 ctx.fillText('SATELLITE NETWORK FAILURE', canvas.width / 2, canvas.height / 2 - 60);
                 ctx.font = '24px Orbitron';
                 ctx.fillText(`Only ${repairedCount} satellites repaired`, canvas.width / 2, canvas.height / 2 - 20);
                 ctx.font = '20px Orbitron';
                 ctx.fillText('The network is down.', canvas.width / 2, canvas.height / 2 + 10);
             }
             if (gameState === 'start') ctx.fillText('Satellite Rescue Mission', canvas.width / 2, canvas.height / 2 - 60);

             ctx.font = '20px Orbitron';
             if (gameState === 'start') {
                 ctx.fillText('A solar storm has damaged satellites in orbit!', canvas.width / 2, canvas.height / 2 - 20);
                 ctx.fillText('Click on damaged satellites to repair them.', canvas.width / 2, canvas.height / 2 + 10);
                 ctx.fillText('Solve the connection puzzle to restore power.', canvas.width / 2, canvas.height / 2 + 40);
             }
             ctx.fillText(gameState === 'start' ? 'Click to start' : 'Click to restart', canvas.width / 2, canvas.height / 2 + 90);
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
        
        const { drone, satellites } = gameObjects.current;

        // Move drone
        if (drone.targetId !== null) {
            const targetSat = satellites.find(s => s.id === drone.targetId);
            if (targetSat) {
                const dx = targetSat.x - drone.x;
                const dy = targetSat.y - drone.y;
                const dist = Math.hypot(dx, dy);
                if (dist < drone.speed * (deltaTime / 16)) {
                    drone.x = targetSat.x;
                    drone.y = targetSat.y;
                    if(targetSat.isDamaged && !drone.repairing) {
                        drone.repairing = true;
                        setTargetSatellite(targetSat);
                        setPuzzle(generatePuzzle(5));
                        setGameState('miniGame');
                    }
                } else {
                    drone.x += (dx / dist) * drone.speed * (deltaTime / 16);
                    drone.y += (dy / dist) * drone.speed * (deltaTime / 16);
                }
            }
        }
        
        draw(ctx, canvas);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const numSatellites = 4 + Math.min(level, 4); // Increase satellites with level
        const orbitRadius = Math.min(canvas.width, canvas.height) / 2 - 70;
        const newSatellites: Satellite[] = [];
        
        for (let i = 0; i < numSatellites; i++) {
            const angle = (i / numSatellites) * Math.PI * 2;
            const types: ('communication' | 'weather' | 'gps' | 'science')[] = 
                ['communication', 'weather', 'gps', 'science'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            newSatellites.push({
                id: i,
                x: canvas.width / 2 + Math.cos(angle) * orbitRadius,
                y: canvas.height / 2 + Math.sin(angle) * orbitRadius,
                angle,
                isDamaged: Math.random() > 0.3, // 70% start damaged
                isFixed: false,
                type
            });
        }
        
        gameObjects.current.satellites = newSatellites;
        gameObjects.current.drone.x = canvas.width / 2;
        gameObjects.current.drone.y = canvas.height / 2;
        gameObjects.current.drone.targetId = null;
        gameObjects.current.drone.repairing = false;

        setRepairedCount(0);
        setTimeLeft(180 - (level - 1) * 15); // Decrease time with higher levels
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
        lastTimeRef.current = performance.now();
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };
    
    const checkPuzzleWin = (currentPuzzle: Tile[][]) => {
        const size = currentPuzzle.length;
        const visited = Array.from({length: size}, () => Array(size).fill(false));
        const queue: {x: number, y: number}[] = [];
        
        // Find start position
        let startPos = {x: -1, y: -1};
        for(let r = 0; r < size; r++) {
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
            
            // Check if we reached the end
            if(tile.type === 'end' && x === size - 1) return true;

            // Get rotated connections
            const r = tile.rotation * (Math.PI / 180);
            const rotatedConnects = tile.connects.map((_, i) => {
                const newIndex = Math.round(i - (r / (Math.PI/2)));
                return tile.connects[(newIndex + 4) % 4];
            });

            // Check neighbors
            // Top
            if (rotatedConnects[0] && y > 0 && !visited[y - 1][x]) {
                const neighbor = currentPuzzle[y - 1][x];
                const neighborRot = neighbor.rotation * (Math.PI / 180);
                const neighborConnects = neighbor.connects.map((_, i) => {
                    const newIndex = Math.round(i - (neighborRot / (Math.PI/2)));
                    return neighbor.connects[(newIndex + 4) % 4];
                });
                if (neighborConnects[2]) { // Bottom connection
                    queue.push({x, y: y-1});
                    visited[y - 1][x] = true;
                }
            }
            
            // Right
            if (rotatedConnects[1] && x < size - 1 && !visited[y][x + 1]) {
                const neighbor = currentPuzzle[y][x + 1];
                const neighborRot = neighbor.rotation * (Math.PI / 180);
                const neighborConnects = neighbor.connects.map((_, i) => {
                    const newIndex = Math.round(i - (neighborRot / (Math.PI/2)));
                    return neighbor.connects[(newIndex + 4) % 4];
                });
                if (neighborConnects[3]) { // Left connection
                    queue.push({x: x+1, y});
                    visited[y][x + 1] = true;
                }
            }
            
            // Bottom
            if (rotatedConnects[2] && y < size - 1 && !visited[y + 1][x]) {
                const neighbor = currentPuzzle[y + 1][x];
                const neighborRot = neighbor.rotation * (Math.PI / 180);
                const neighborConnects = neighbor.connects.map((_, i) => {
                    const newIndex = Math.round(i - (neighborRot / (Math.PI/2)));
                    return neighbor.connects[(newIndex + 4) % 4];
                });
                if (neighborConnects[0]) { // Top connection
                    queue.push({x, y: y+1});
                    visited[y + 1][x] = true;
                }
            }
            
            // Left
            if (rotatedConnects[3] && x > 0 && !visited[y][x - 1]) {
                const neighbor = currentPuzzle[y][x - 1];
                const neighborRot = neighbor.rotation * (Math.PI / 180);
                const neighborConnects = neighbor.connects.map((_, i) => {
                    const newIndex = Math.round(i - (neighborRot / (Math.PI/2)));
                    return neighbor.connects[(newIndex + 4) % 4];
                });
                if (neighborConnects[1]) { // Right connection
                    queue.push({x: x-1, y});
                    visited[y][x - 1] = true;
                }
            }
        }
        return false;
    };

    const handleTileClick = (row: number, col: number) => {
        if (!targetSatellite) return;
        
        const newPuzzle = puzzle.map(r => r.map(c => ({...c})));
        const tile = newPuzzle[row][col];
        
        // Rotate tile
        tile.rotation = (tile.rotation + 90) % 360;
        setPuzzle(newPuzzle);
        
        // Check for win condition
        if(checkPuzzleWin(newPuzzle)) {
            // Fix the satellite
            const newSatellites = gameObjects.current.satellites.map(s => {
                if (s.id === targetSatellite.id) {
                    return {...s, isDamaged: false, isFixed: true};
                }
                return s;
            });
            
            gameObjects.current.satellites = newSatellites;
            const newRepairedCount = repairedCount + 1;
            setRepairedCount(newRepairedCount);
            
            // Check if all satellites are repaired
            const allRepaired = newSatellites.every(s => !s.isDamaged);
            if (allRepaired) {
                // Level up
                setLevel(l => l + 1);
                setGameState('win');
                if (timerId.current) clearInterval(timerId.current);
            } else {
                // Return to game
                setGameState('playing');
                gameObjects.current.drone.repairing = false;
                gameObjects.current.drone.targetId = null;
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
                    if (Math.hypot(mouseX - sat.x, mouseY - sat.y) < 30 && sat.isDamaged) {
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
                    <div className="bg-gray-900/90 border-2 border-sky-400 p-6 rounded-2xl shadow-2xl shadow-sky-500/30 max-w-md">
                        <h4 className="text-xl font-bold text-center text-sky-300 mb-4">Re-route Power!</h4>
                        <p className="text-center text-gray-300 mb-4 text-sm">
                            Rotate tiles to create a path from the green start to the red end.
                        </p>
                        <div className="grid grid-cols-5 gap-1 bg-gray-800 p-2 rounded-md">
                            {puzzle.map((row, rIdx) => row.map((tile, cIdx) => (
                                <div 
                                    key={`${rIdx}-${cIdx}`} 
                                    onClick={() => handleTileClick(rIdx, cIdx)} 
                                    className="w-14 h-14 flex items-center justify-center cursor-pointer bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
                                >
                                    <canvas
                                        width="40"
                                        height="40"
                                        ref={(canvas) => {
                                            if (canvas) {
                                                const ctx = canvas.getContext('2d');
                                                if (ctx) {
                                                    // Clear canvas
                                                    ctx.clearRect(0, 0, 40, 40);
                                                    
                                                    // Draw tile
                                                    drawTile(ctx, tile, 0, 0, 40);
                                                    
                                                    // Highlight start/end
                                                    if (tile.type === 'start') {
                                                        ctx.fillStyle = '#22c55e';
                                                        ctx.beginPath();
                                                        ctx.arc(20, 20, 5, 0, Math.PI * 2);
                                                        ctx.fill();
                                                    } else if (tile.type === 'end') {
                                                        ctx.fillStyle = '#ef4444';
                                                        ctx.beginPath();
                                                        ctx.arc(20, 20, 5, 0, Math.PI * 2);
                                                        ctx.fill();
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )))}
                        </div>
                        <div className="mt-4 text-center">
                            <button 
                                onClick={() => {
                                    setGameState('playing');
                                    gameObjects.current.drone.repairing = false;
                                    gameObjects.current.drone.targetId = null;
                                }}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                            >
                                Cancel Repair
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default ImprovedSatelliteRescue;