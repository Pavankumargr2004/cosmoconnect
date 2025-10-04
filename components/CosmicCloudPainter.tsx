import React, { useRef, useEffect, useState } from 'react';
import { generateColoringPage } from '../services/geminiService';

const cosmicColors = ['#ff00ff', '#ff00aa', '#aa00ff', '#00aaff', '#00ffff', '#aaff00'];

interface CosmicCloudPainterProps {
    addAchievement: (id: string) => void;
}

const CosmicCloudPainter: React.FC<CosmicCloudPainterProps> = ({ addAchievement }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isPainting, setIsPainting] = useState(false);
    const [currentColor, setCurrentColor] = useState('#ff00ff');
    const [brushSize, setBrushSize] = useState(50);
    const [brushType, setBrushType] = useState<'nebula' | 'stars'>('nebula');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const hasPaintedRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const resizeCanvas = () => {
            if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                const context = canvas.getContext('2d');
                if (context) {
                    context.lineCap = 'round';
                    context.globalAlpha = 0.2;
                    contextRef.current = context;
                }
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        }
    }, []);

    const startPainting = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        if (contextRef.current) {
            contextRef.current.beginPath();
            contextRef.current.moveTo(offsetX, offsetY);
            setIsPainting(true);
        }
    };

    const stopPainting = () => {
        if (contextRef.current) {
            contextRef.current.closePath();
            setIsPainting(false);
        }
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isPainting) return;
        
        if (!hasPaintedRef.current) {
            addAchievement('cosmic-artist');
            hasPaintedRef.current = true;
        }

        const { offsetX, offsetY } = nativeEvent;
        const context = contextRef.current;
        if (!context) return;

        if (brushType === 'nebula') {
            context.globalCompositeOperation = 'lighter';
            context.globalAlpha = 0.1;
            const radius = brushSize;
            const grad = context.createRadialGradient(offsetX, offsetY, 0, offsetX, offsetY, radius);
            const colorHex = currentColor.replace('#', '');
            const r = parseInt(colorHex.substring(0, 2), 16);
            const g = parseInt(colorHex.substring(2, 4), 16);
            const b = parseInt(colorHex.substring(4, 6), 16);
            
            grad.addColorStop(0, `rgba(${r},${g},${b},0.8)`);
            grad.addColorStop(0.5, `rgba(${r},${g},${b},0.2)`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            context.fillStyle = grad;

            context.beginPath();
            context.arc(offsetX, offsetY, radius, 0, Math.PI * 2);
            context.fill();

        } else if (brushType === 'stars') {
            context.globalCompositeOperation = 'source-over';
            context.globalAlpha = 1;
            for (let i = 0; i < 5; i++) {
                const x = offsetX + (Math.random() - 0.5) * brushSize * 2;
                const y = offsetY + (Math.random() - 0.5) * brushSize * 2;
                const radius = Math.random() * 1.5 + 0.5;
                const alpha = Math.random() * 0.5 + 0.5;
                context.fillStyle = `rgba(255, 255, 220, ${alpha})`;
                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI * 2);
                context.fill();
            }
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        setImageUrl(null);
    };

    const generateImageFromCanvas = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        setIsGenerating(true);
        try {
            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL('image/png');
            
            // Create a prompt based on the painting
            const prompt = "A beautiful cosmic nebula with swirling colors and stars, painted in a dreamy, artistic style";
            
            // Generate image using Gemini API
            const imageBytes = await generateColoringPage(prompt);
            if (imageBytes) {
                setImageUrl(`data:image/png;base64,${imageBytes}`);
            }
        } catch (error) {
            console.error("Error generating image:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <h3 className="text-xl font-bold mb-2 text-center">Mission: Cosmic Cloud Painter</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">Unleash your inner artist! Paint a swirling nebula where stars are born, or sprinkle galaxies across the void.</p>

            <div className="flex flex-col lg:flex-row gap-4 h-[70vh] max-h-[500px]">
                <div className="flex-shrink-0 lg:w-48 bg-gray-900/50 p-4 rounded-lg border border-violet-700/30 flex flex-col gap-4">
                    <div>
                        <label className="font-bold text-violet-300">Color</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {cosmicColors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setCurrentColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${currentColor === color ? 'border-white' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Select color ${color}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="font-bold text-violet-300" htmlFor="brushSize">Brush Size</label>
                        <input
                            type="range"
                            id="brushSize"
                            min="10"
                            max="100"
                            value={brushSize}
                            onChange={e => setBrushSize(Number(e.target.value))}
                            className="w-full mt-2"
                        />
                    </div>
                    <div>
                        <label className="font-bold text-violet-300">Brush Type</label>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => setBrushType('nebula')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${brushType === 'nebula' ? 'bg-sky-500 text-white' : 'bg-gray-700 text-violet-200'}`}>Nebula</button>
                            <button onClick={() => setBrushType('stars')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${brushType === 'stars' ? 'bg-sky-500 text-white' : 'bg-gray-700 text-violet-200'}`}>Stars</button>
                        </div>
                    </div>
                    <button 
                        onClick={generateImageFromCanvas} 
                        disabled={isGenerating}
                        className="mt-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 rounded-full font-semibold disabled:opacity-50"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Image'}
                    </button>
                    <button onClick={clearCanvas} className="mt-auto px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-full font-semibold">Clear</button>
                </div>
                <div className="flex-grow w-full h-64 lg:h-full rounded-lg overflow-hidden bg-black cursor-crosshair border border-violet-700/30 relative">
                    {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt="Generated cosmic artwork" 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startPainting}
                            onMouseUp={stopPainting}
                            onMouseLeave={stopPainting}
                            onMouseMove={draw}
                            className="w-full h-full"
                        />
                    )}
                    {isGenerating && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="text-white text-center">
                                <div className="w-12 h-12 border-4 border-t-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin mx-auto mb-2"></div>
                                <p>Generating your cosmic artwork...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CosmicCloudPainter;