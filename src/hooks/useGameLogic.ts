import { useState, useCallback, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  shape: number[][];
  position: Position;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ]
};

export const useGameLogic = () => {
  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const checkCollision = useCallback((piece: Tetromino, board: number[][]) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const boardY = piece.position.y + y;
          const boardX = piece.position.x + x;
          
          // 천장에 닿았는지 확인
          if (boardY < 0) {
            setGameOver(true);
            return true;
          }
          
          if (
            boardX < 0 ||
            boardX >= BOARD_WIDTH ||
            boardY >= BOARD_HEIGHT ||
            board[boardY][boardX] !== 0
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, [setGameOver]);

  const createNewPiece = useCallback(() => {
    const tetrominoTypes = Object.keys(TETROMINOES);
    const randomType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
    const newPiece: Tetromino = {
      shape: TETROMINOES[randomType as keyof typeof TETROMINOES],
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 }
    };

    // 새로운 블록이 생성될 때 충돌 체크
    if (checkCollision(newPiece, board)) {
      setGameOver(true);
    }

    return newPiece;
  }, [board, checkCollision, setGameOver]);

  const clearLines = useCallback((board: number[][]) => {
    const newBoard = board.map(row => [...row]);
    let linesCleared = 0;
    let completedLines: number[] = [];

    // 완성된 라인 찾기
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell === 1)) {
        completedLines.push(y);
        linesCleared++;
      }
    }

    // 완성된 라인 제거
    for (const y of completedLines) {
      newBoard.splice(y, 1);
    }

    // 새로운 빈 라인 추가
    for (let i = 0; i < linesCleared; i++) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    if (linesCleared > 0) {
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + (linesCleared * 100 * level));
      
      // 10줄마다 레벨업
      if (lines + linesCleared >= level * 10) {
        setLevel(prev => prev + 1);
      }
    }

    return newBoard;
  }, [lines, level]);

  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    if (!currentPiece || gameOver || isPaused) return;

    const newPosition = { ...currentPiece.position };
    switch (direction) {
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
    }

    const newPiece = { ...currentPiece, position: newPosition };
    if (!checkCollision(newPiece, board)) {
      setCurrentPiece(newPiece);
    } else if (direction === 'down') {
      const newBoard = board.map(row => [...row]);
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] !== 0) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            if (boardY < 0) {
              // 천장에 닿으면 게임오버
              setGameOver(true);
              return;
            }
            if (boardY >= 0) {
              newBoard[boardY][boardX] = 1;
            }
          }
        }
      }
      setBoard(newBoard);
      const updatedBoard = clearLines(newBoard);
      setBoard(updatedBoard);
      setCurrentPiece(createNewPiece());
    }
  }, [currentPiece, board, checkCollision, createNewPiece, gameOver, isPaused, clearLines, setGameOver]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    // 90도 회전: 행렬을 전치하고 각 행을 뒤집음
    const newShape = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );

    const newPiece = { ...currentPiece, shape: newShape };
    if (!checkCollision(newPiece, board)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, board, checkCollision, gameOver, isPaused]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    // 게임 루프를 일시적으로 정지
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    let newPosition = { ...currentPiece.position };
    let dropDistance = 0;

    // 블록이 바닥에 닿을 때까지의 거리를 계산
    while (!checkCollision({ ...currentPiece, position: { ...newPosition, y: newPosition.y + dropDistance + 1 } }, board)) {
      dropDistance++;
    }

    // 계산된 거리만큼 한 번에 이동
    newPosition.y += dropDistance;
    
    // 이동 후 바로 고정
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardY = newPosition.y + y;
          const boardX = newPosition.x + x;
          if (boardY < 0) {
            // 천장에 닿으면 게임오버
            setGameOver(true);
            return;
          }
          if (boardY >= 0) {
            newBoard[boardY][boardX] = 1;
          }
        }
      }
    }
    setBoard(newBoard);
    const updatedBoard = clearLines(newBoard);
    setBoard(updatedBoard);
    setCurrentPiece(createNewPiece());

    // 게임 루프 재시작
    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        movePiece('down');
      }, 1000 / level);
    }
  }, [currentPiece, board, checkCollision, createNewPiece, gameOver, isPaused, level, movePiece, clearLines, setGameOver]);

  useEffect(() => {
    if (!currentPiece) {
      const newPiece = createNewPiece();
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, createNewPiece]);

  useEffect(() => {
    // 기존 게임 루프 정리
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    if (gameOver || isPaused) return;

    // 새로운 게임 루프 시작
    gameLoopRef.current = setInterval(() => {
      movePiece('down');
    }, 1000 / level);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [movePiece, level, gameOver, isPaused]);

  const startGame = useCallback(() => {
    // 게임 상태 초기화
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setCurrentPiece(createNewPiece());

    // 이전 게임 루프가 있다면 정지
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    // 새로운 게임 루프 시작
    gameLoopRef.current = setInterval(() => {
      movePiece('down');
    }, 1000 / level);
  }, [createNewPiece, level, movePiece]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      if (prev) {
        // 일시정지 해제 시 게임 루프 재시작
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
        gameLoopRef.current = setInterval(() => {
          movePiece('down');
        }, 1000 / level);
      } else {
        // 일시정지 시 게임 루프 정지
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      }
      return !prev;
    });
  }, [movePiece, level]);

  return {
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
  };
}; 