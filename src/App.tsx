import React, { useEffect } from 'react';
import { Board } from './components/Board';
import { useGameLogic } from './hooks/useGameLogic';
import './App.css';

function App() {
  const {
    board,
    currentPiece,
    score,
    level,
    lines,
    gameOver,
    isPaused,
    movePiece,
    rotatePiece,
    hardDrop,
    startGame,
    togglePause
  } = useGameLogic();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (gameOver) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        movePiece('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        movePiece('right');
        break;
      case 'ArrowDown':
        e.preventDefault();
        movePiece('down');
        break;
      case 'ArrowUp':
        e.preventDefault();
        rotatePiece();
        break;
      case ' ':
        e.preventDefault();
        hardDrop();
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        togglePause();
        break;
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece('right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece('down');
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotatePiece();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePiece, hardDrop, togglePause, gameOver]);

  return (
    <div className="tetris-container">
      <h1 className="game-title">TETRIS</h1>
      <div className="game-info">
        <div>점수: {score}</div>
        <div>레벨: {level}</div>
        <div>줄: {lines}</div>
      </div>
      <div className="game-board" tabIndex={0}>
        <Board 
          board={board} 
          currentPiece={currentPiece}
          gameOver={gameOver}
          isPaused={isPaused}
        />
        {gameOver && !board.every(row => row.every(cell => cell === 0)) && (
          <div className="game-over-overlay">
            <div className="game-over-text">게임오버</div>
          </div>
        )}
        {isPaused && !gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-text">일시정지</div>
          </div>
        )}
      </div>
      <div className="controls">
        <button onClick={startGame}>
          {gameOver ? '게임시작' : '초기화'}
        </button>
        <button onClick={togglePause}>{isPaused ? '재개' : '일시정지'}</button>
      </div>
      <div className="instructions">
        <p>← → : 이동</p>
        <p>↑ : 회전</p>
        <p>↓ : 빠르게 내리기</p>
        <p>스페이스 : 즉시 내리기</p>
        <p>P : 일시정지</p>
      </div>
    </div>
  );
}

export default App; 