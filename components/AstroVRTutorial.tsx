import React, { useState } from 'react';

const AstroVRTutorial: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [step, setStep] = useState(0);

    const tutorialSteps = [
        {
            title: "Welcome to AstroVR!",
            description: "Get ready to explore a stunning 360° space environment. This short guide will help you get started.",
            icon: 'welcome'
        },
        {
            title: 'Look Around',
            description: 'On mobile, simply move your phone. On desktop, click and drag your mouse. If you have a VR headset, just look around!',
            icon: 'look'
        },
        {
            title: 'Explore the Scene',
            description: "Immerse yourself in the cosmic scenery. You're floating amongst the stars and nebulae.",
            icon: 'explore'
        },
        {
            title: "You're Ready!",
            description: "Enjoy your journey through the cosmos!",
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
            case 'look': return <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
            case 'explore': return <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 16l-4 4-4-4 5.293-5.293a1 1 0 011.414 0L13 14m5-11l2.293 2.293a1 1 0 010 1.414L10 16l-4 4-4-4 5.293-5.293a1 1 0 011.414 0L13 14" /></svg>;
            case 'complete': return <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            default: return null;
        }
    };

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in-fast">
            <div className="w-full max-w-md bg-black/50 border border-violet-500/50 rounded-2xl p-8 text-center flex flex-col items-center animate-zoom-in m-4">
                <Icon type={currentStep.icon} />
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">{currentStep.title}</h3>
                <p className="text-violet-200 mb-8 min-h-[4rem]">{currentStep.description}</p>
                
                <div className="flex items-center justify-center w-full">
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105 hover:from-blue-600 hover:to-cyan-500"
                    >
                        {isLastStep ? "Enter VR" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AstroVRTutorial;
