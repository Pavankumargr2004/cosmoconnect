import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supportedLanguages, Language } from '../i18n/translations';
import GithubIcon from './icons/GithubIcon';
import LinkedinIcon from './icons/LinkedinIcon';
import XIcon from './icons/XIcon';
import { Page } from '../App';
import BlackholeIcon from './icons/BlackholeIcon';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const selectLanguage = (langCode: Language) => {
    setLanguage(langCode);
    setIsDropdownOpen(false);
  };


  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 mt-auto backdrop-blur-md bg-gray-900/40 border-t border-violet-800/50 flex-shrink-0">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-violet-300">
        
        <div className="lg:col-span-2 space-y-4">
            <div 
              className="group flex items-center gap-3 cursor-pointer w-fit" 
              onClick={() => onNavigate('home')}
            >
              <BlackholeIcon />
              <span className="text-2xl font-bold tracking-wider">
                <span className="text-sky-400">Cosmo</span><span className="text-violet-400">Connect</span>
              </span>
            </div>
            <p className="text-sm max-w-md">&copy; {new Date().getFullYear()}. All rights reserved. An innovative project by students of Dayananda Sagar University.</p>
            <div className="flex items-center gap-6">
              <a href="https://github.com/Pavankumargr2004" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-violet-300 hover:text-white transition-colors"><GithubIcon /></a>
              <a href="https://www.linkedin.com/in/pavan-kumar-gr-6404112a7" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-violet-300 hover:text-white transition-colors"><LinkedinIcon /></a>
              <a href="https://x.com/pavan192004" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-violet-300 hover:text-white transition-colors"><XIcon /></a>
            </div>
             <div ref={dropdownRef} className="relative flex items-center gap-2 pt-2">
               <span className="text-sm">{t('languageLabel')}</span>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-28 text-left px-3 py-1 bg-violet-700/50 hover:bg-violet-700/80 rounded-md text-violet-200 font-semibold transition-colors flex justify-between items-center"
                    aria-label="Select language"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <span>{supportedLanguages.find(l => l.code === language)?.name}</span>
                    <svg className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isDropdownOpen && (
                    <div className="absolute bottom-full mb-2 w-full bg-gray-800/90 backdrop-blur-sm border border-violet-700/50 rounded-md shadow-lg z-10 animate-fade-in-fast">
                        <ul className="py-1">
                            {supportedLanguages.map(lang => (
                                <li key={lang.code}>
                                    <button
                                        onClick={() => selectLanguage(lang.code)}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${language === lang.code ? 'bg-violet-600 text-white' : 'text-violet-200 hover:bg-violet-700'}`}
                                    >
                                        {lang.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-white">{t('footerQuickLinks')}</h4>
          <ul className="space-y-2">
            <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">{t('home')}</button></li>
            <li><button onClick={() => onNavigate('solar-stories')} className="hover:text-white transition-colors">{t('solar-stories')}</button></li>
            <li><button onClick={() => onNavigate('learning-missions')} className="hover:text-white transition-colors">{t('learning-missions')}</button></li>
            <li><button onClick={() => onNavigate('about-us')} className="hover:text-white transition-colors">{t('about-us')}</button></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-bold text-white">{t('footerResources')}</h4>
          <ul className="space-y-2">
            <li><a href="https://www.nasa.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('footerNASAHome')}</a></li>
            <li><a href="https://science.nasa.gov/kids/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('footerNASAKids')}</a></li>
            <li><a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('footerAPOD')}</a></li>
            <li><a href="https://ccmc.gsfc.nasa.gov/donki/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('footerDONKI')}</a></li>
          </ul>
        </div>

      </div>
    </footer>
  );
};

export default Footer;