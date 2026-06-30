import React from 'react';
import Board from './components/Board';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NMG Forge Kanban Board</h1>
      </header>
      <main className="app-main">
        <Board />
      </main>
    </div>
  );
}

export default App;
