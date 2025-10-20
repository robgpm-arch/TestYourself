if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then(rs => rs.forEach(r => r.unregister()))
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
