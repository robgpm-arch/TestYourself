// Keep messaging SW behavior, but register a lightweight app SW to ensure fresh loads
if ('serviceWorker' in navigator) {
  // Unregister old stray workers (best-effort)
  navigator.serviceWorker
    .getRegistrations()
    .then(rs => rs.forEach(r => r.unregister()))
    .catch(() => {});

  // Register cache-busting SW that immediately takes control
  navigator.serviceWorker
    .register('/sw-v3.js', { scope: '/' })
    .then(reg => {
      if (reg.waiting) {
        try { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch {}
      }
    })
    .catch(() => {});
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { FlowProvider } from './navigation/FlowProvider';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <FlowProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </FlowProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
);
