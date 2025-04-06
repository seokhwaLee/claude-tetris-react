export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  shape: number[][];
  position: Position;
} 