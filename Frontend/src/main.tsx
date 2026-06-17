import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fafafa',
          },
        }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
