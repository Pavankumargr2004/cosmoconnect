
import React, { ReactNode, useEffect } from 'react';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
        onClose();
       }
    };
    if (isOpen) {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEsc);
    } else {
        document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
    
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-stretch animate-fade-in-fast p-4 sm:p-6 md:p-8">
      <header className="w-full flex justify-between items-center pb-4 flex-shrink-0">
        <h3 className="text-xl font-bold text-sky-300">{title || ''}</h3>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-violet-600/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:bg-violet-600"
          aria-label="Close fullscreen view"
        >
          &times; Close
        </button>
      </header>
      <main className="relative w-full h-full flex-grow">
        {children}
      </main>
    </div>
  );
};

export default FullscreenModal;
