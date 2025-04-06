import React from 'react';
import { Tetromino } from '../types';

const CELL_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

interface BoardProps {
  board: number[][];
  currentPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
}

export const Board: React.FC<BoardProps> = ({ board, currentPiece, gameOver, isPaused }) => {
  const renderCell = (value: number, x: number, y: number) => {
    const isCurrentPiece = currentPiece && 
      y >= currentPiece.position.y && 
      y < currentPiece.position.y + currentPiece.shape.length &&
      x >= currentPiece.position.x && 
      x < currentPiece.position.x + currentPiece.shape[0].length &&
      currentPiece.shape[y - currentPiece.position.y]?.[x - currentPiece.position.x] === 1;

    return (
      <div
        key={`${x}-${y}`}
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          backgroundColor: isCurrentPiece ? '#00f' : value ? '#666' : '#222',
          border: '1px solid #444',
          position: 'absolute',
          left: x * CELL_SIZE,
          top: y * CELL_SIZE,
        }}
      />
    );
  };

  return (
    <div
      style={{
        width: BOARD_WIDTH * CELL_SIZE,
        height: BOARD_HEIGHT * CELL_SIZE,
        backgroundColor: '#111',
        position: 'relative',
        border: '2px solid #333',
      }}
    >
      {board.map((row, y) =>
        row.map((cell, x) => renderCell(cell, x, y))
      )}
    </div>
  );
}; 