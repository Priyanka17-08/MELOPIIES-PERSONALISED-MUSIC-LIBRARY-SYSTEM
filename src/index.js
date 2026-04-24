import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Remove error overlay in development
if (process.env.NODE_ENV === 'development') {
  const observer = new MutationObserver(() => {
    const overlay = document.querySelector('iframe[style*="z-index: 2147483647"]');
    if (overlay) overlay.remove();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);