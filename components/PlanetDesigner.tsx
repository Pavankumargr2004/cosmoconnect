import React, { useState, useEffect, useRef } from 'react';
// Fix: Import types.ts to make A-Frame custom element types available to JSX.
import '../types';
import { Content } from '@google/genai';
import { getPlanetDesignerResponse } from '../services/geminiService';

interface PlanetConfig {
    color: string;
    hasRings: boolean;
    hasClouds: boolean;
}

interface PlanetDesignerProps {
    addAchievement: (id: string) => void;
}

const PlanetViewer: React.FC<{ planetConfig: PlanetConfig }> = ({ planetConfig }) => {
  return (
    <div className="w-full h-full rounded-lg animate-fade-in bg-gray-900/50">
        <a-scene
            embedded
            renderer="colorManagement: true; alpha: true;"
            vr-mode-ui="enabled: false"
            style={{ backgroundColor: 'transparent' }}
        >
            <a-entity rotation="0 0 0">
                <a-animation attribute="rotation" to="0 360 0" dur="25000" easing="linear" repeat="indefinite"></a-animation>
                <a-sphere position="0 0 0" radius="1" color={planetConfig.color}></a-sphere>
                {planetConfig.hasRings && (
                    <a-torus color="#B0A08C" segments-tubular="50" radius="1.8" radius-tubular="0.1" rotation="90 0 0" scale="1 1 0.05">
                         <a-animation attribute="rotation" from="90 0 0" to="90 360 0" dur="40000" easing="linear" repeat="indefinite"></a-animation>
                    </a-torus>
                )}
                 {planetConfig.hasClouds && (
                    <a-sphere position="0 0 0" radius="1.05" color="#FFFFFF" material="transparent: true; opacity: 0.4;">
                         <a-animation attribute="rotation" to="0 360 0" dur="50000" easing="linear" repeat="indefinite"></a-animation>
                    </a-sphere>
                )}
            </a-entity>
            <a-camera position="0 0 4"></a-camera>
            <a-light type="ambient" color="#FFF" intensity="0.5"></a-light>
            <a-light type="directional" color="#FFF" intensity="0.8" position="-3 2 4"></a-light>
        </a-scene>
    </div>
  )
}

const PlanetDesigner: React.FC<PlanetDesignerProps> = ({ addAchievement }) => {
    const [messages, setMessages] = useState<Content[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [planetConfig, setPlanetConfig] = useState<PlanetConfig>({
        color: '#cccccc',
        hasRings: false,
        hasClouds: false,
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getInitialMessage = async () => {
            const history: Content[] = [];
            const responseText = await getPlanetDesignerResponse(history, "Hi Nova, let's design a planet!");
            setMessages([{ role: 'model', parts: [{ text: responseText }] }]);
            setIsLoading(false);
        };
        getInitialMessage();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const updatePlanetFromText = (text: string) => {
        const lowerText = text.toLowerCase();
        const colors: { [key: string]: string } = {
            'red': '#FF5733', 'blue': '#337BFF', 'green': '#33FF57',
            'yellow': '#FFFF33', 'purple': '#A833FF', 'orange': '#FF9633',
            'pink': '#FF33A1', 'white': '#FFFFFF', 'brown': '#964B00'
        };
        for (const color in colors) {
            if (lowerText.includes(color)) {
                setPlanetConfig(p => ({ ...p, color: colors[color] }));
                break; 
            }
        }
        
        if (lowerText.includes('ring')) setPlanetConfig(p => ({ ...p, hasRings: true }));
        if (lowerText.includes('cloud') || lowerText.includes('atmosphere')) setPlanetConfig(p => ({ ...p, hasClouds: true }));
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages: Content[] = [...messages, { role: 'user', parts: [{ text: userInput }] }];
        setMessages(newMessages);

        if (newMessages.filter(m => m.role === 'user').length >= 5) {
            addAchievement('planet-designer');
        }

        updatePlanetFromText(userInput);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        const history = newMessages;
        const responseText = await getPlanetDesignerResponse(history, currentInput);

        setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
        updatePlanetFromText(responseText);
        setIsLoading(false);
    };

    return (
        <div className="w-full bg-black/30 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6 backdrop-blur-sm border border-violet-700/30">
            <h3 className="text-xl font-bold mb-2 text-center">Mission: Design-A-Planet</h3>
            <p className="text-center text-violet-300 mb-4 text-sm">Chat with your AI guide, Nova, to create a unique world from your imagination!</p>
            
            <div className="flex flex-col lg:flex-row h-[70vh] max-h-[600px] gap-6">
                <div className="w-full lg:w-1/2 h-64 lg:h-full min-h-[250px]">
                    <PlanetViewer planetConfig={planetConfig} />
                </div>
                <div className="w-full lg:w-1/2 flex flex-col bg-gray-900/50 rounded-lg overflow-hidden border border-violet-700/30">
                    <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar">
                       {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-sky-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                                    <p className="text-white whitespace-pre-wrap">{msg.parts[0].text}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                             <div className="flex justify-start">
                                <div className="max-w-xs md:max-w-sm rounded-2xl px-4 py-2 bg-gray-700 rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse delay-0"></span>
                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse delay-150"></span>
                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse delay-300"></span>
                                     </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-violet-700/50">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Type your ideas..."
                                className="w-full bg-gray-900/50 border border-violet-600 rounded-full px-4 py-2 text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                disabled={isLoading}
                            />
                            <button type="submit" className="px-4 py-2 bg-sky-600 rounded-full hover:bg-sky-700 disabled:opacity-50" disabled={isLoading || !userInput.trim()}>
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PlanetDesigner;