import React, { useState, useEffect, useMemo, useRef, ComponentType } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Storybook from './components/Storybook';
import ARMode from './components/ARMode';
import ARSection from './components/ARSection';
import Perspectives from './components/Perspectives';
import TelescopeQuiz from './components/TelescopeQuiz';
import PlanetDesigner from './components/PlanetDesigner';
import CosmicCloudPainter from './components/CosmicCloudPainter';
import AuroraExplorer from './components/AuroraExplorer';
import SolarSystemExplorer from './components/SolarSystemExplorer';
import TelescopeExplorer from './components/TelescopeExplorer';
import JamesWebbExplorer from './components/JamesWebbExplorer';
import CMEAnalysis from './components/CMEAnalysis';
import SectionCard from './components/SectionCard';
import CosmoBuddy from './components/CosmoBuddy';
import Achievements, { Achievement as AchievementType } from './components/Achievements';
import InteractivesPage from './components/InteractivesPage';
import { useLanguage } from './contexts/LanguageContext';
import { getAPOD, getRecentCMEs } from './services/spaceWeatherService';
import { getBedtimeStory, generateColoringPage, getObscureSpaceFact } from './services/geminiService';
import { APODData, CMEData } from './types';

import LiveSunnyStatus from './components/LiveSunnyStatus';
import AstroVRTutorial from './components/AstroVRTutorial';
import AuroraMusicBox from './components/AuroraMusicBox';
import GalacticActivitiesHub from './components/GalacticActivitiesHub';
import SpaceQuiz from './components/SpaceQuiz';
import CosmicCollectorGame from './components/CosmicCollectorGame';
import StellarSymphony from './components/StellarSymphony';
import CMEImpactSimulator from './components/CMEImpactSimulator';
import FullscreenModal from './components/FullscreenModal';
import GravitySlingshot from './components/GravitySlingshot';
import SatelliteRescue from './components/SatelliteRescue';
import ParkerSolarProbeGame from './components/ParkerSolarProbeGame';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
// Import improved games
import ImprovedCosmicCollector from './components/ImprovedCosmicCollector';
import ImprovedGravitySlingshot from './components/ImprovedGravitySlingshot';
import ImprovedSolarShieldDefense from './components/ImprovedSolarShieldDefense';
import ImprovedSatelliteRescue from './components/ImprovedSatelliteRescue';
import GlobalMission from './components/GlobalMission';
import AsteroidBeltNavigator from './components/AsteroidBeltNavigator';

// =================================================================
// TYPE DEFINITIONS
// =================================================================

export type Page = 'home' | 'solar-stories' | 'bedtime-stories' | 'learning-missions' | 'explore' | 'interactives' | 'about-us' | 'astro-vr' | 'achievements';

const navLinks: { id: Page }[] = [
    { id: 'home' },
    { id: 'solar-stories' },
    { id: 'bedtime-stories' },
    { id: 'learning-missions' },
    { id: 'explore' },
    { id: 'interactives' },
    { id: 'about-us' },
    { id: 'astro-vr' },
];

interface AchievementProps {
    addAchievement: (id: string) => void;
}

const allAchievements: AchievementType[] = [
    { id: 'story-explorer', emoji: '🗺️', title: 'Story Explorer', description: 'Made 5 choices in the Living Storybook.' },
    { id: 'orbital-mechanic', emoji: '🛰️', title: 'Orbital Mechanic', description: 'Complete 3 levels in Gravity Slingshot.' },
    { id: 'satellite-savior', emoji: '🔧', title: 'Satellite Savior', description: 'Repair 3 satellites in a single Satellite Rescue mission.' },
    { id: 'planetary-protector', emoji: '🌍', title: 'Planetary Protector', description: 'Successfully defend Earth from 20 solar flares.' },
    { id: 'aurora-artist', emoji: '🎨', title: 'Aurora Artist', description: 'Painted a beautiful aurora.' },
    { id: 'cosmic-artist', emoji: '🌌', title: 'Cosmic Artist', description: 'Painted a beautiful cosmic cloud.' },
    { id: 'cosmic-photographer', emoji: '📸', title: 'Cosmic Photographer', description: 'Completed the Telescope Image Quiz.' },
    { id: 'stellar-interviewer', emoji: '🎙️', title: 'Stellar Interviewer', description: 'Heard from all of Sunny\'s friends.' },
    { id: 'sky-watcher', emoji: '👀', title: 'Sky Watcher', description: 'Checked for aurora activity.' },
    { id: 'planet-designer', emoji: '🪐', title: 'Planet Designer', description: 'Designed a new planet from scratch.' },
    { id: 'star-fragment-hoarder', emoji: '💎', title: 'Star Fragment Hoarder', description: 'Collect 20 star fragments in Cosmic Collector.' },
    { id: 'cosmic-scholar', emoji: '🎓', title: 'Cosmic Scholar', description: 'Completed all 5 levels of the Space Quiz.' },
];

// =================================================================
// NEW PAGE & SUB-COMPONENTS
// =================================================================

const APOD: React.FC = () => {
    const { t } = useLanguage();
    const [apodData, setApodData] = useState<APODData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApod = async (forceRefresh: boolean = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAPOD(forceRefresh);
            setApodData(data);
        } catch (err) {
            setError(t('apodErrorText'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApod();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="max-w-5xl mx-auto bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center">
                    <LoadingSpinner message={t('loading')} size="lg" />
                </div>
            );
        }

        if (error || !apodData) {
            return (
                <div className="max-w-5xl mx-auto bg-red-900/40 rounded-2xl border border-red-500/30 p-8 text-center">
                    <h3 className="text-2xl font-bold text-red-300 mb-2">{t('apodErrorTitle')}</h3>
                    <p className="text-red-200 mb-4">{error}</p>
                    <button 
                        onClick={() => fetchApod(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105"
                    >
                        {t('retry')}
                    </button>
                </div>
            )
        }

        return (
            <div className="max-w-5xl mx-auto bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center animate-fade-in-fast">
                <div className="md:w-1/2 flex-shrink-0">
                    <h3 className="text-2xl font-bold text-violet-200 mb-2">{apodData.title}</h3>
                    <p className="font-mono text-sm text-violet-400 mb-4">{t('apodDate')}: {apodData.date}</p>
                    <p className="text-violet-300 max-h-48 overflow-y-auto pr-2">
                        {apodData.explanation}
                    </p>
                    <button onClick={() => fetchApod(true)} className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105 hover:from-blue-600 hover:to-cyan-500">
                        {t('apodSeeAnother')}
                    </button>
                </div>
                <div className="md:w-1/2 w-full h-64 md:h-auto md:aspect-square rounded-lg overflow-hidden bg-gray-900">
                     {apodData.media_type === 'image' ? (
                        <img src={apodData.url} alt={apodData.title} className="w-full h-full object-cover"/>
                     ) : (
                        <iframe src={apodData.url} title={apodData.title} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full"></iframe>
                     )}
                </div>
            </div>
        );
    }

    return (
        <section className="my-16 md:my-24 w-full animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{t('apodTitle')}</h2>
            {renderContent()}
        </section>
    );
}

const SpaceWeatherDashboard: React.FC = () => {
    const { t } = useLanguage();
    const [cmeData, setCmeData] = useState<CMEData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getRecentCMEs();
                // Sort by start time to easily find the most recent
                data.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                setCmeData(data);
            } catch (err) {
                setError(t('dashboardErrorText'));
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [t]);

    // FIX: Fix type errors in the `fastestCME` calculation by making the accumulator type explicit,
    // safely handling cases where `cmeAnalyses` might be empty, and ensuring `topAnalysis` is
    // correctly typed before its properties are accessed.
    const fastestCME = useMemo(() => {
        if (cmeData.length === 0) return null;
        // Find the analysis with the highest speed in each CME, then find the overall fastest
        return cmeData.reduce<(CMEData & { speed: number; time: string }) | null>((fastest, cme) => {
            if (!cme.cmeAnalyses || cme.cmeAnalyses.length === 0) {
                return fastest;
            }

            const topAnalysis = cme.cmeAnalyses.reduce((fastestAnalysis, analysis) => {
                return analysis.speed > fastestAnalysis.speed ? analysis : fastestAnalysis;
            });

            if (topAnalysis.speed > (fastest?.speed || 0)) {
                return {
                    ...cme,
                    speed: topAnalysis.speed,
                    time: topAnalysis.time21_5
                };
            }
            return fastest;
        }, null);
    }, [cmeData]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid md:grid-cols-2 gap-6">
                    <LoadingSpinner message={t('loadingSpaceWeather')} size="lg" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-900/40 rounded-2xl border border-red-500/30 p-8 text-center">
                    <h3 className="text-2xl font-bold text-red-300 mb-2">{t('dashboardErrorTitle')}</h3>
                    <p className="text-red-200 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105"
                    >
                        {t('retry')}
                    </button>
                </div>
            )
        }
        
        if (cmeData.length === 0) {
            return (
                 <div className="bg-black/40 rounded-2xl border border-violet-500/30 p-8 text-center">
                    <h3 className="text-2xl font-bold text-green-300 mb-2">{t('dashboardAllQuiet')}</h3>
                    <p className="text-violet-200">{t('dashboardAllQuietText')}</p>
                </div>
            )
        }

        return (
            <div className="grid md:grid-cols-2 gap-6 animate-fade-in-fast">
                <div className="bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-6 text-center">
                    <p className="text-lg text-violet-300">{t('dashboardCMEs')}</p>
                    <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 my-2">{cmeData.length}</p>
                    <p className="text-5xl">💥</p>
                </div>
                {fastestCME && (
                     <div className="bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-6 text-center flex flex-col justify-center">
                        <p className="text-lg text-violet-300">{t('dashboardFastestCME')}</p>
                        <p className="text-4xl font-bold text-cyan-300 my-2">{Math.round(fastestCME.speed)} km/s</p>
                        <p className="text-sm text-violet-400 font-mono">
                            {t('dashboardDetected')}: {new Date(fastestCME.startTime).toLocaleString()}
                        </p>
                     </div>
                )}
            </div>
        )
    }

    return (
        <section className="container mx-auto px-4 py-8 animate-zoom-in">
             <div className="text-center mb-12">
                <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    {t('dashboardTitle')}
                </h1>
                <p className="text-lg text-violet-200 max-w-2xl mx-auto mt-4">
                    {t('dashboardSubtitle')}
                </p>
            </div>
            {renderContent()}
        </section>
    );
};

const HomePage: React.FC<{ onNavigate: (page: Page) => void; onLaunchAR: () => void; onTriggerEasterEgg: () => void; isEasterEggLoading: boolean }> = ({ onNavigate, onLaunchAR, onTriggerEasterEgg, isEasterEggLoading }) => {
    const { t } = useLanguage();
    const [typedSentence, setTypedSentence] = useState('');
    const [isSolarProbeFullscreen, setIsSolarProbeFullscreen] = useState(false);
    const sentencesToType = useMemo(() => [
        t('homeTyping1'),
        t('homeTyping2'),
        t('homeTyping3'),
        t('homeTyping4')
    ], [t]);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        let sentenceIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typingSpeed = 100;
        const deletingSpeed = 50;
        const pauseDuration = 2000;

        const typeEffect = () => {
            const currentSentence = sentencesToType[sentenceIndex];
            if (isDeleting) {
                charIndex--;
                setTypedSentence(currentSentence.substring(0, charIndex));
            } else {
                charIndex++;
                setTypedSentence(currentSentence.substring(0, charIndex));
            }

            if (!isDeleting && charIndex === currentSentence.length) {
                isDeleting = true;
                timeoutRef.current = window.setTimeout(typeEffect, pauseDuration);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                sentenceIndex = (sentenceIndex + 1) % sentencesToType.length;
                timeoutRef.current = window.setTimeout(typeEffect, 500);
            } else {
                timeoutRef.current = window.setTimeout(typeEffect, isDeleting ? deletingSpeed : typingSpeed);
            }
        };
        
        timeoutRef.current = window.setTimeout(typeEffect, 250);
        
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [sentencesToType]);

    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4">
             <div className="w-full grid md:grid-cols-2 items-center gap-8 text-center md:text-left">
                <div className="animate-fade-in">
                    <h1 className="text-5xl lg:text-6xl font-bold leading-tight min-h-[7.5rem] lg:min-h-[4.75rem] flex items-center justify-center md:justify-start">
                        <div>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300">
                                {typedSentence}
                            </span>
                            <span className="animate-blink-cursor text-cyan-300">|</span>
                        </div>
                    </h1>
                    <p className="text-lg text-violet-200 max-w-xl mx-auto md:mx-0 mt-6">
                        {t('homeSubtitle')}
                    </p>
                    <button onClick={() => onNavigate('explore')} className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105 hover:from-blue-600 hover:to-cyan-500">
                        {t('explore')}
                    </button>
                </div>
                 <div className="w-full h-64 md:h-96 flex items-center justify-center animate-zoom-in relative">
                    <img 
                        src="https://lh3.googleusercontent.com/d/1xnSRCcy9W07x0ygZnpDyl-On2EdP8ax_" 
                        alt={t('homeSunAlt')} 
                        title={t('homeSunTitle')}
                        onClick={onTriggerEasterEgg}
                        className={`w-64 h-64 md:w-96 md:h-96 rounded-full object-cover animate-spin-slow animate-pulse-glow transition-all duration-300 ${isEasterEggLoading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:scale-105'}`} 
                    />
                    {isEasterEggLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full pointer-events-none">
                            <div className="w-12 h-12 border-4 border-t-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>
            <LiveSunnyStatus />
            <APOD />
            <section className="my-16 md:my-24 w-full max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div 
                    className="bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-6 cursor-pointer transition-all duration-300 hover:shadow-cyan-500/20 hover:shadow-lg hover:border-cyan-400/50"
                    onClick={() => setIsSolarProbeFullscreen(true)}
                >
                    <h2 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-center">NASA's Parker Solar Probe</h2>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-900 mb-4">
                        <img 
                            src="components/assets/solarprobe1.png" 
                            alt="Parker Solar Probe" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="text-violet-300 mb-4 text-center">The spacecraft is flying closer to the Sun's surface than any spacecraft before it. Click to explore the mission in detail.</p>
                    <div className="text-center">
                        <button className="px-6 py-2 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105">
                            Explore Mission
                        </button>
                    </div>
                </div>
            </section>
            {isSolarProbeFullscreen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
                    <div className="flex justify-between items-center p-4 bg-black/50">
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">NASA's Parker Solar Probe Mission</h2>
                        <button 
                            onClick={() => setIsSolarProbeFullscreen(false)}
                            className="px-4 py-2 bg-violet-600/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:bg-violet-600"
                        >
                            ← Back
                        </button>
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <iframe 
                            src="https://eyes.nasa.gov/apps/solar-system/#/sc_parker_solar_probe" 
                            className="w-full h-full"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

const StoryCard: React.FC<{ title: string; description: string; imageUrl: string; onClick: () => void; }> = ({ title, description, imageUrl, onClick }) => {
    const { t } = useLanguage();
    return (
        <div onClick={onClick} className="group bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm flex flex-col text-center items-center transition-all duration-300 hover:shadow-cyan-500/20 hover:shadow-lg hover:border-cyan-400/50 cursor-pointer">
            <div className="w-full aspect-square bg-gray-900 overflow-hidden">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-6 flex flex-col flex-grow w-full">
                <h3 className="text-xl font-bold text-violet-200 mb-3">{title}</h3>
                <p className="text-violet-300 text-sm mb-6 flex-grow">{description}</p>
                <button className="mt-auto px-8 py-2 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 group-hover:shadow-cyan-500/50 group-hover:scale-105 self-center">
                    {t('explore')}
                </button>
            </div>
        </div>
    );
};


const SolarStoriesPage: React.FC<AchievementProps> = ({ addAchievement }) => {
    const { t } = useLanguage();
    const [isStoryActive, setIsStoryActive] = useState(false);
    
    // By using static images, we prevent unnecessary API calls, fix the rate-limiting error,
    // and ensure the page loads quickly and reliably every time.
    const stories = useMemo(() => [
        { 
            title: t('story1Title'), 
            description: t('story1Desc'),
            imageUrl: "components/assets/solarflar1.jpg",
        },
        { 
            title: t('story2Title'), 
            description: t('story2Desc'),
            imageUrl: "components/assets/eathlings.jpg",
        },
        { 
            title: t('story3Title'), 
            description: t('story3Desc'),
            imageUrl: "components/assets/space_senitals.jpg",
        }
    ], [t]);

    if (isStoryActive) {
        return (
            <div className="container mx-auto px-4 py-8 animate-zoom-in w-full">
                <button 
                    onClick={() => setIsStoryActive(false)} 
                    className="mb-6 px-4 py-2 bg-violet-600/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:bg-violet-600"
                >
                    ← {t('missionsBackButton')}
                </button>
                <div className="w-full max-w-6xl mx-auto">
                    <Storybook addAchievement={addAchievement} />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-zoom-in">
            <div className="text-center mb-12">
                <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    {t('solarStoriesTitle')}
                </h1>
                <p className="text-lg text-violet-200 max-w-2xl mx-auto mt-4">
                    {t('solarStoriesSubtitle')}
                </p>
            </div>
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map((story, index) => (
                    <StoryCard
                        key={index}
                        title={story.title}
                        description={story.description}
                        imageUrl={story.imageUrl}
                        onClick={() => setIsStoryActive(true)}
                    />
                ))}
            </div>
        </div>
    );
};

const BedtimeStoriesPage: React.FC = () => {
    const { t } = useLanguage();
    const [story, setStory] = useState<{ text: string; imagePrompt: string } | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [topic, setTopic] = useState('');
    const [mood, setMood] = useState<'Calming' | 'Adventurous' | 'Silly'>('Calming');

    const fetchStory = async () => {
        setIsLoading(true);
        setError(null);
        setStory(null);
        setImageUrl(null);
        try {
            const { story: newStory, imagePrompt } = await getBedtimeStory(topic, mood);
            setStory({ text: newStory, imagePrompt });
            
            // Generate image using the imagePrompt
            const imageBytes = await generateColoringPage(imagePrompt);
            if (imageBytes) {
                setImageUrl(`data:image/png;base64,${imageBytes}`);
            }
        } catch (err) {
            setError(t('bedtimeFetchError'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setStory(null);
        setImageUrl(null);
        setError(null);
        setTopic('');
        setMood('Calming');
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="w-full max-w-3xl flex flex-col items-center gap-6 p-4 sm:p-8">
                    <LoadingSpinner message={t('generatingStory')} size="lg" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-8 bg-red-900/40 rounded-2xl border border-red-500/30">
                    <h3 className="text-2xl font-bold text-red-300 mb-2">{t('error')}</h3>
                    <p className="text-red-200 mb-4">{error}</p>
                    <button 
                        onClick={handleReset}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105"
                    >
                        {t('tryAgain')}
                    </button>
                </div>
            );
        }
        
        if (story) {
            // Use generated image if available, otherwise fallback to static image
            const displayImageUrl = imageUrl || "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1200&auto-format=fit-crop";
            return (
                <div className="flex flex-col items-center gap-6 p-4 sm:p-8 animate-fade-in w-full">
                    <div className="w-full aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center border border-violet-700/30 overflow-hidden">
                        <img src={displayImageUrl} alt="A beautiful starry night sky" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xl md:text-2xl text-violet-200 leading-relaxed text-center">{story.text}</p>
                </div>
            );
        }

        return null;
    };

    const moodOptions: { key: 'Calming' | 'Adventurous' | 'Silly'; labelKey: string }[] = [
        { key: 'Calming', labelKey: 'bedtimeMoodCalming' },
        { key: 'Adventurous', labelKey: 'bedtimeMoodAdventurous' },
        { key: 'Silly', labelKey: 'bedtimeMoodSilly' }
    ];

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center animate-zoom-in">
            <div className="text-center mb-12">
                <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    {t('bedtimeStoriesTitle')}
                </h1>
                <p className="text-lg text-violet-200 max-w-2xl mx-auto mt-4">
                    {t('bedtimeStoriesSubtitle')}
                </p>
            </div>
            
            <div className="w-full max-w-3xl bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm flex items-center justify-center">
                {story || isLoading || error ? (
                    <div className="w-full p-6 text-center">
                        {renderContent()}
                        <button onClick={handleReset} className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105">
                            {t('bedtimeCreateAnother')}
                        </button>
                    </div>
                ) : (
                     <div className="w-full p-6 sm:p-8 animate-fade-in">
                         <div className="space-y-6">
                            <div>
                                <label htmlFor="topic" className="block text-lg font-medium text-violet-300 mb-2 text-center">{t('bedtimeTopicLabel')}</label>
                                <input
                                    type="text"
                                    id="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={t('bedtimeTopicPlaceholder')}
                                    className="w-full bg-gray-900/70 border border-violet-600 rounded-full px-4 py-3 text-white text-center placeholder-violet-400/70 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                />
                            </div>
                             <div>
                                <label className="block text-lg font-medium text-violet-300 mb-3 text-center">{t('bedtimeMoodLabel')}</label>
                                <div className="flex justify-center gap-3">
                                    {moodOptions.map(m => (
                                        <button
                                            key={m.key}
                                            onClick={() => setMood(m.key)}
                                            className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 ${mood === m.key ? 'bg-sky-500 text-white shadow-lg' : 'bg-gray-700/50 text-violet-200 hover:bg-gray-700'}`}
                                        >
                                            {t(m.labelKey)}
                                        </button>
                                    ))}
                                </div>
                             </div>
                             <div className="text-center pt-4">
                                <button onClick={fetchStory} disabled={isLoading} className="px-8 py-3 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105 disabled:opacity-50">
                                    {t('bedtimeCreateStory')}
                                </button>
                             </div>
                         </div>
                     </div>
                )}
            </div>
        </div>
    );
};


const LearningMissionsPage: React.FC<AchievementProps> = ({ addAchievement }) => {
    const { t } = useLanguage();
    const [activeMission, setActiveMission] = useState<string | null>(null);

    const missions = useMemo(() => [
        { id: 'galactic-activities-hub', title: t('galacticHubTitle'), description: t('galacticHubDesc'), component: <GalacticActivitiesHub /> },
        { id: 'telescope-quiz', title: t('telescopeQuizTitle'), description: t('telescopeQuizDesc'), component: <TelescopeQuiz addAchievement={addAchievement}/> },
        { id: 'space-quiz', title: t('spaceQuizTitle'), description: t('spaceQuizDesc'), component: <SpaceQuiz addAchievement={addAchievement}/> },
        { id: 'planet-designer', title: t('planetDesignerTitle'), description: t('planetDesignerDesc'), component: <PlanetDesigner addAchievement={addAchievement}/> },
        { id: 'cloud-painter', title: t('cloudPainterTitle'), description: t('cloudPainterDesc'), component: <CosmicCloudPainter addAchievement={addAchievement}/> },
        { id: 'global-mission', title: t('globalMissionTitle'), description: t('globalMissionDesc'), component: <GlobalMission addAchievement={addAchievement} /> },
        { id: 'cosmic-collector', title: t('cosmicCollectorTitle'), description: t('cosmicCollectorDesc'), component: <ImprovedCosmicCollector addAchievement={addAchievement}/> },
        { id: 'asteroid-navigator', title: t('asteroidNavigatorTitle'), description: t('asteroidNavigatorDesc'), component: <AsteroidBeltNavigator addAchievement={addAchievement}/> },
        { id: 'parker-solar-probe', title: t('parkerSolarProbeTitle'), description: t('parkerSolarProbeDesc'), component: <ParkerSolarProbeGame addAchievement={addAchievement} /> },
    ], [addAchievement, t]);

    const activeMissionData = missions.find(m => m.id === activeMission);

    if (activeMission === 'space-quiz' && activeMissionData) {
        return (
            <FullscreenModal
                isOpen={true}
                onClose={() => setActiveMission(null)}
                title={activeMissionData.title}
            >
                {activeMissionData.component}
            </FullscreenModal>
        );
    }

    if (activeMission) {
        return (
            <div className="container mx-auto px-4 py-8 animate-zoom-in">
                <button onClick={() => setActiveMission(null)} className="mb-8 px-4 py-2 bg-violet-600/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:bg-violet-600">
                    {t('missionsBackButton')}
                </button>
                {activeMissionData?.component}
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8 animate-zoom-in">
             <div className="text-center mb-12">
                <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    {t('missionsPageTitle')}
                </h1>
                <p className="text-lg text-violet-200 max-w-2xl mx-auto mt-4">
                    {t('missionsPageSubtitle')}
                </p>
            </div>
            {/* Display all cards in rows of three */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {missions.map(mission => (
                    <SectionCard
                        key={mission.id}
                        title={mission.title}
                        description={mission.description}
                        onExplore={() => setActiveMission(mission.id)}
                    />
                ))}
            </div>
        </div>
    );
};

const ExplorePage: React.FC<AchievementProps> = ({ addAchievement }) => {
    const { t } = useLanguage();
    const [activeExplorer, setActiveExplorer] = useState<string | null>(null);

     const explorers = useMemo(() => [
        { id: 'solar-system', title: t('solarSystemTitle'), description: t('solarSystemDesc'), component: <SolarSystemExplorer /> },
        { id: 'aurora-music-box', title: t('auroraMusicBoxTitle'), description: t('auroraMusicBoxDesc'), component: <AuroraMusicBox /> },
        { id: 'stellar-symphony', title: t('stellarSymphonyTitle'), description: t('stellarSymphonyDesc'), component: <StellarSymphony /> },
        { id: 'cme-simulator', title: t('cmeSimulatorTitle'), description: t('cmeSimulatorDesc'), component: <CMEImpactSimulator /> },
        { id: 'enter-sunny', title: t('homeAREntice'), description: t('homeARDesc'), component: <ARSection /> },
        { id: 'perspectives', title: t('perspectivesTitle'), description: t('perspectivesDesc'), component: <Perspectives addAchievement={addAchievement}/> },
        { id: 'aurora-explorer', title: t('auroraTitle'), description: t('auroraDesc'), component: <AuroraExplorer addAchievement={addAchievement} /> },
        { id: 'great-observatories', title: t('telescopesTitle'), description: t('telescopesDesc'), component: <TelescopeExplorer /> },
        { id: 'cme-analysis', title: t('cmeAnalysisTitle'), description: t('cmeAnalysisDesc'), component: <CMEAnalysis /> },
    ], [addAchievement, t]);

    if (activeExplorer) {
        const explorer = explorers.find(e => e.id === activeExplorer);
        return (
            <div className="container mx-auto px-4 py-8 animate-zoom-in">
                <button onClick={() => setActiveExplorer(null)} className="mb-8 px-4 py-2 bg-violet-600/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:bg-violet-600">
                    {t('exploreBackButton')}
                </button>
                {explorer?.component}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-zoom-in">
             <div className="text-center mb-12">
                <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    {t('explorePageTitle')}
                </h1>
                <p className="text-lg text-violet-200 max-w-2xl mx-auto mt-4">
                    {t('explorePageSubtitle')}
                </p>
            </div>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {explorers.map(explorer => (
                    <SectionCard
                        key={explorer.id}
                        title={explorer.title}
                        description={explorer.description}
                        onExplore={() => setActiveExplorer(explorer.id)}
                    />
                ))}
            </div>
        </div>
    );
};

const AstroVRPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const tutorialCompleted = localStorage.getItem('astroVrTutorialCompleted');
        if (!tutorialCompleted) {
            setShowTutorial(true);
        }
    }, []);

    const handleCloseTutorial = () => {
        localStorage.setItem('astroVrTutorialCompleted', 'true');
        setShowTutorial(false);
    };

    return (
        <div className="w-full h-screen absolute top-0 left-0 z-10">
            {isLoading && !showTutorial && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#00bfff]">
                    <div className="absolute top-0 text-center bg-[#008b8b] p-4 w-full">
                        <p className="text-2xl font-bold text-white">AstroVR 360 - VR space loading, please wait</p>
                    </div>
                    <div className="text-white text-6xl font-mono animate-pulse">..</div>
                </div>
            )}
            {showTutorial && <AstroVRTutorial onClose={handleCloseTutorial} />}
            <iframe
                src="https://vr-nine-xi.vercel.app/"
                title="AstroVR 360"
                className="w-full h-full border-none"
                style={{ visibility: showTutorial ? 'hidden' : 'visible' }}
                allow="accelerometer; autoplay; camera; gyroscope; magnetometer; microphone; xr-spatial-tracking"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
            />
            <button
                onClick={() => onNavigate('home')}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-violet-600/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:bg-violet-600"
            >
                {t('exitVR')}
            </button>
        </div>
    );
};

const AboutUsPage: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="container mx-auto px-4 py-8 animate-zoom-in">
            <div className="text-center mb-12">
                <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    {t('aboutUsTitle')}
                </h1>
            </div>
            <div className="max-w-4xl mx-auto bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-8 space-y-6 text-lg text-violet-200 leading-relaxed">
                <p>{t('aboutUsP1')}</p>
                <p>{t('aboutUsP2')}</p>
                <p>{t('aboutUsP3')}</p>
            </div>
        </div>
    );
};


// =================================================================
// MAIN APP COMPONENT
// =================================================================

export default function App() {
  const { t } = useLanguage();
  const [page, setPage] = useState<Page>('home');
  const [isArActive, setIsArActive] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [easterEggMessage, setEasterEggMessage] = useState<string | null>(null);
  const [isEasterEggLoading, setIsEasterEggLoading] = useState(false);

  useEffect(() => {
    const storedAchievements = localStorage.getItem('unlockedAchievements');
    if (storedAchievements) {
        setUnlockedAchievements(JSON.parse(storedAchievements));
    }
  }, []);
  
  const handleTriggerEasterEgg = async () => {
    if (isEasterEggLoading) return;
    setIsEasterEggLoading(true);
    try {
        const fact = await getObscureSpaceFact();
        setEasterEggMessage(fact);
    } catch (error) {
        console.error("Failed to fetch easter egg:", error);
        setEasterEggMessage("Did you know... something amazing is out there!");
    } finally {
        setIsEasterEggLoading(false);
    }
  };

  const addAchievement = (id: string) => {
    setUnlockedAchievements(prev => {
        if (prev.includes(id)) {
            return prev;
        }
        const newAchievements = [...prev, id];
        localStorage.setItem('unlockedAchievements', JSON.stringify(newAchievements));
        return newAchievements;
    });
  };

  const onNavigate = (newPage: Page) => {
    setPage(newPage);
    if (newPage !== 'astro-vr') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const onLaunchAR = () => {
    if ((navigator as any).xr) {
        setIsArActive(true);
    } else {
        alert("Sorry, your browser doesn't support the AR experience!");
    }
  };

  // FIX: Fix "Cannot find namespace 'JSX'" error by removing the explicit `JSX.Element` return type from `useMemo` and relying on TypeScript's type inference, which correctly determines the return type.
  // FIX: Replaced the page map with a switch statement to correctly pass props to each page component, resolving a TypeScript error where props were being passed to components that did not expect them. This also makes `useMemo` dependencies explicit.
  const PageContent = useMemo(() => {
    switch (page) {
        case 'home':
            return <HomePage 
                        onNavigate={onNavigate}
                        onLaunchAR={onLaunchAR}
                        onTriggerEasterEgg={handleTriggerEasterEgg}
                        isEasterEggLoading={isEasterEggLoading}
                   />;
        case 'solar-stories':
            return <SolarStoriesPage addAchievement={addAchievement} />;
        case 'bedtime-stories':
            return <BedtimeStoriesPage />;
        case 'learning-missions':
            return <LearningMissionsPage addAchievement={addAchievement} />;
        case 'explore':
            return <ExplorePage addAchievement={addAchievement} />;
        case 'interactives':
            return <InteractivesPage />;
        case 'about-us':
            return <AboutUsPage />;
        case 'astro-vr':
            return <AstroVRPage onNavigate={onNavigate} />;
        case 'achievements':
            return <Achievements unlockedAchievements={unlockedAchievements} allAchievements={allAchievements} />;
        default:
            return <HomePage 
                        onNavigate={onNavigate}
                        onLaunchAR={onLaunchAR}
                        onTriggerEasterEgg={handleTriggerEasterEgg}
                        isEasterEggLoading={isEasterEggLoading}
                   />;
    }
  }, [page, unlockedAchievements, isEasterEggLoading]);

  return (
    <div className="flex flex-col min-h-screen">
        {page !== 'astro-vr' && <Header activePage={page} onNavigate={onNavigate} navLinks={navLinks} />}
        <main className={page !== 'astro-vr' ? "flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" : "flex-grow"}>
            <ErrorBoundary>
                {PageContent}
            </ErrorBoundary>
        </main>
        {page !== 'astro-vr' && <Footer onNavigate={onNavigate} />}
        {isArActive && <ARMode onClose={() => setIsArActive(false)} />}
        <CosmoBuddy />
        {easterEggMessage && (
            <div 
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-md"
              onClick={() => setEasterEggMessage(null)}
            >
                <div className="max-w-lg bg-black/50 border border-amber-400/50 rounded-2xl p-8 text-center m-4 animate-zoom-in">
                    <p className="text-4xl mb-4">🌟</p>
                    <h3 className="text-2xl font-bold text-amber-300 mb-2">{t('easterEggTitle')}</h3>
                    <p className="text-lg text-violet-200">{easterEggMessage}</p>
                </div>
            </div>
        )}
    </div>
  );
}