import { useState, useEffect } from 'react';
import './App.css';

const TICK_INTERVAL_MS = 100;

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

type GameState = {
  board: boolean[];
  activePiece: {
    x: number;
    y: number;
  };
  score: number;
};

type Coord = {
  x: number;
  y: number;
};

type Board = boolean[];

function index_to_coords(index : number) : Coord {
  return {
    x: index % BOARD_WIDTH,
    y: Math.floor(index / BOARD_WIDTH)
  };
}

function empty_board() : Board {
  const board = [];
  for (let i = 0; i < BOARD_WIDTH * BOARD_HEIGHT; i++) {
    board.push(false);

  }
  return board;
}

function addPiece(board : Board, x : number, y : number) {
  const newBoard = [...board];
  newBoard[y * BOARD_WIDTH + x] = true;
  return newBoard;
}



function newGame() {
  return {
    board: empty_board(),
    activePiece: {
      x: Math.floor(BOARD_WIDTH / 2),
      y: 0
    },
    score: 0
  };
}

function movePiece(gameState : GameState, x : number, y : number) {
  if (gameState.activePiece.x + x < 0 || gameState.activePiece.x + x >= BOARD_WIDTH) {
    return gameState;
  }
  if (gameState.activePiece.y + y < 0 || gameState.activePiece.y + y >= BOARD_HEIGHT) {
    return gameState;
  }
  if (gameState.board[(gameState.activePiece.y + y) * BOARD_WIDTH + gameState.activePiece.x + x]) {
    return gameState;
  }
  const newGameState = {...gameState};
  newGameState.activePiece = {
    x: gameState.activePiece.x + x,
    y: gameState.activePiece.y + y};
  return newGameState;
}

function checkFullRow(gameState : GameState, y : number) {
  for (let x = 0; x < BOARD_WIDTH; x++) {
    if (!gameState.board[y * BOARD_WIDTH + x]) {
      return false;
    }
  }
  return true;
}

function respawnPiece(gameState : GameState) {
  const newGameState = {...gameState};
  newGameState.activePiece = {
    x: Math.floor(BOARD_WIDTH / 2),
    y: 0
  };
  newGameState.board = addPiece(
    gameState.board,
    gameState.activePiece.x,
    gameState.activePiece.y);

  if (checkFullRow(newGameState, BOARD_HEIGHT - 1)) {
    newGameState.board.splice(BOARD_WIDTH * (BOARD_HEIGHT - 1), BOARD_WIDTH);
    for (let y = 0; y < BOARD_WIDTH; y++) {
      newGameState.board.unshift(false);
    }
    newGameState.score += 1;
  }
  return newGameState;
}

function isPieceBelow(gameState : GameState) {
  return gameState.board[(gameState.activePiece.y + 1) * BOARD_WIDTH + gameState.activePiece.x];
}

function useGameClock() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((tick) => tick + 1);
    }, TICK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
  return tick;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(newGame());
  const tick = useGameClock();

  useEffect(() => {
    if (gameState.activePiece.y === BOARD_HEIGHT - 1 || isPieceBelow(gameState)) {
      setGameState(respawnPiece);
      return
    }
    setGameState(movePiece(gameState, 0, 1));
  }, [tick]);

  useEffect(() => {
    const handleArrowKeys = (event : any) => {
      const keyCode = event.keyCode;
      switch (keyCode) {
        case 37: // Left arrow
          setGameState((gameState) => movePiece(gameState, -1, 0));
          break;
        case 39: // Right arrow
          setGameState((gameState) => movePiece(gameState, 1, 0));
          break;
        case 40: // Down arrow
          setGameState((gameState) => movePiece(gameState, 0, 1));
          break;
        default:
          break;
      }
    };
    document.addEventListener('keydown', handleArrowKeys);
    return () => {
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, []);

  return (
    <div className="App">
      <h1>Monotris</h1>
      <div className="game">
        <div className="board">
        {
          gameState.board.map((value, index) => {
            const coords = index_to_coords(index);
            return <div key={index} className={value || gameState.activePiece.x === coords.x && gameState.activePiece.y === coords.y ? "filled" : "empty"} />;
          })
        }
        </div>
        <div className="panel">
          <div>Score: <p className="score-value">{gameState.score}</p></div>
          <div>
            Next Block:
            <div className="preview">
              <div className="filled" />
            </div>
          </div>
          <div>
            <button onClick={() => setGameState(newGame)}>New Game</button>
          </div>
        </div>
      </div>
      <div className="footer">
        <a href="https://github.com/cthulahoops/monotris/">Github</a>
      </div>
    </div>
  );
}
