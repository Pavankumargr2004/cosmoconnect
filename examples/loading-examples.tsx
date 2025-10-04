import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

// Example usage of LoadingSpinner component
const LoadingExamples: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Loading Spinner Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Small Spinner</h2>
          <LoadingSpinner size="sm" message="Loading..." />
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Medium Spinner</h2>
          <LoadingSpinner size="md" message="Processing..." />
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Large Spinner</h2>
          <LoadingSpinner size="lg" message="Fetching data..." />
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Full Screen Loading</h2>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" message="Loading your cosmic experience..." />
        </div>
      </div>
    </div>
  );
};

export default LoadingExamples;