
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Fix: Import types.ts at the app's entry point to globally declare A-Frame's custom elements for JSX.
import './types';
import { LanguageProvider } from './contexts/LanguageContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);