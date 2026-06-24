import React from 'react';
import Board from './components/Board';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NMG Forge Board</h1>
      </header>
      <main className="app-main">
        <Board />
      </main>
      <SpeedInsights />
    </div>
  );
}

export default App;
