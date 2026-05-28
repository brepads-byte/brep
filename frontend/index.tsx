
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const currentHash = window.location.hash;

if (currentHash && currentHash.startsWith("#/")) {
  // Extract everything after the '#' symbol (e.g., '#/projects' becomes '/projects')
  const cleanPath = currentHash.replace("#", "");
  
  // Instantly swap the browser window location without breaking the history stack
  window.location.replace(cleanPath);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);