import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
// 👇 THIS IS THE MISSING LINK FOR TAILWIND
import './src/index.css'; 

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Fatal Error: Could not find root element with id 'root' to mount to.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);