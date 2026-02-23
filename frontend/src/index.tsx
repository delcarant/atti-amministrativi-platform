import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Punto di ingresso dell'applicazione React.
 * Monta il componente App sul nodo root del DOM.
 */
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
