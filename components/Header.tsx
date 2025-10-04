
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Page } from '../App';
import BlackholeIcon from './icons/BlackholeIcon';

interface HeaderProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  navLinks: { id: Page }[];
}

const Header: React.FC<HeaderProps> = ({ activePage, onNavigate, navLinks }) => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMobileNav = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  }

  return (
    <header className="py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-lg flex-shrink-0">
      <div className="container mx-auto flex justify-between items-center">
        <div 
          className="group flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate('home')}
        >
          <div className="w-6 h-6 relative group-hover:[&>div]:animate-swirl-fast">
            <div className="absolute inset-0 border-2 border-dashed border-violet-400 rounded-full animate-swirl-slow"></div>
            <div className="absolute inset-1 border-2 border-dashed border-sky-400 rounded-full animate-swirl-medium"></div>
            <div className="absolute inset-2 bg-black rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-wider">
              <span className="text-sky-400">Cosmo</span>
            </span>
            <span className="text-lg font-bold tracking-wider -mt-1">
              <span className="text-violet-400">Connect</span>
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => {
            const isActive = activePage === link.id;
            const isVrButton = link.id === 'astro-vr';
            const buttonClasses = isVrButton
              ? `px-4 py-1.5 rounded-md font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors duration-300 shadow-lg hover:shadow-violet-500/50 text-sm ${isActive ? 'ring-2 ring-white/70' : ''}`
              : `font-semibold transition-colors duration-300 text-sm ${isActive ? 'text-white' : 'text-violet-300 hover:text-white'}`;
            
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={buttonClasses}
              >
                {t(link.id)}
              </button>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-2">
          <button 
             onClick={() => onNavigate('achievements')}
             className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1
                ${activePage === 'achievements' ? 'text-yellow-300 bg-yellow-700/50' : 'text-yellow-300 hover:bg-yellow-700/50'}`
             }
             aria-label="Show Achievements"
           >
            <span className="text-xl">🏆</span>
            <span className="hidden sm:inline text-sm">{t('achievements')}</span>
           </button>
           
           {/* Mobile Menu Button */}
           <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-white" aria-label="Open menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  )}
              </svg>
           </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-black/70 backdrop-blur-lg animate-fade-in-fast">
              <nav className="flex flex-col items-center gap-4 py-6">
                 {navLinks.map(link => (
                    <button
                        key={link.id}
                        onClick={() => handleMobileNav(link.id)}
                        className={`font-semibold text-lg py-2 ${activePage === link.id ? 'text-white' : 'text-violet-300'}`}
                    >
                        {t(link.id)}
                    </button>
                 ))}
              </nav>
          </div>
      )}
    </header>
  );
};

export default Header;
