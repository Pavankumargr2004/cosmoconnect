import React, { useState } from 'react';

const ARTutorial: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [step, setStep] = useState(0);

    const tutorialSteps = [
        {
            title: "Welcome to Sunny's World!",
            description: "This quick guide will show you how to bring Sunny into your room.",
            icon: 'welcome'
        },
        {
            title: 'Scan Your Space',
            description: 'Slowly move your phone around to scan your floor. A magical aurora will appear where you can place Sunny.',
            icon: 'scan'
        },
        {
            title: 'Meet Sunny!',
            description: "Once you find a spot, Sunny the Solar Flare will appear. You might need to look around to find him!",
            icon: 'sunny'
        },
        {
            title: 'Interact and Play',
            description: 'You can tap on Sunny to see a fun sparkle effect and hear a magical chime!',
            icon: 'interact'
        },
        {
            title: "You're Ready!",
            description: "Have fun exploring the cosmos with Sunny right in your own world!",
            icon: 'complete'
        }
    ];

    const currentStep = tutorialSteps[step];
    const isLastStep = step === tutorialSteps.length - 1;

    const handleNext = () => {
        if (!isLastStep) {
            setStep(s => s + 1);
        } else {
            onClose();
        }
    };
    
    const Icon: React.FC<{ type: string }> = ({ type }) => {
        const iconStyle = "w-24 h-24 text-cyan-300 mb-4";
        switch (type) {
            case 'welcome': return <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case 'scan': return <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zM5 12H4a1 1 0 000 2h1m14 0h1a1 1 0 000-2h-1m-1-5v-1a1 1 0 00-2 0v1m0 10v1a1 1 0 002 0v-1" /></svg>;
            case 'sunny': return <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
            case 'interact': return <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 8.812a13.94 13.94 0 011.623-3.024M9 9l.46-2.28a2.47 2.47 0 011.66-.265 2.47 2.47 0 011.658.265l.46 2.28M15 15l2-5" /></svg>;
            case 'complete': return <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            default: return null;
        }
    };

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in-fast" style={{ zIndex: 1002 }}>
            <div className="w-full max-w-md bg-black/50 border border-violet-500/50 rounded-2xl p-8 text-center flex flex-col items-center animate-zoom-in m-4">
                <Icon type={currentStep.icon} />
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">{currentStep.title}</h3>
                <p className="text-violet-200 mb-8 min-h-[4rem]">{currentStep.description}</p>
                
                <div className="flex items-center justify-between w-full">
                    <button onClick={onClose} className="text-sm text-violet-400 hover:text-white transition-colors">
                        Skip Tutorial
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105 hover:from-blue-600 hover:to-cyan-500"
                    >
                        {isLastStep ? "Start AR!" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ARTutorial;
