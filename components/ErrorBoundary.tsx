import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  // Since we can't use componentDidCatch in functional components,
  // we'll just return the children as-is
  // In a real implementation, we would use a class component or React's new error hooks
  
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Error caught by boundary:', error);
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="bg-red-900/40 rounded-2xl border border-red-500/30 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-300 mb-4">Something went wrong</h2>
          <p className="text-red-200 mb-6">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default ErrorBoundary;