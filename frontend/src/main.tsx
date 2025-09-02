import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      toastOptions={{
        success: {
          style: {
            background: '#1a202c',
            color: '#fff',
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          style: {
            background: '#1a202c',
            color: '#fff',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  </StrictMode>
);
