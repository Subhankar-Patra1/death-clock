
// FIX: Import React and ReactDOM.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TestApp from './TestApp';

// Add error handling and debugging
console.log('Extension script starting...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Could not find root element to mount to");
  throw new Error("Could not find root element to mount to");
}

console.log('Root element found, creating React root...');

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created, rendering app...');
  
  // Use the full App
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
  // Fallback to basic HTML
  rootElement.innerHTML = `
    <div style="width: 100vw; height: 100vh; background-color: #0a0a0f; color: white; display: flex; align-items: center; justify-content: center; flex-direction: column;">
      <h1>Death Clock Extension</h1>
      <p>Error loading React app: ${error}</p>
      <p>Check the console for more details.</p>
    </div>
  `;
}