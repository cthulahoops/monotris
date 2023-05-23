import { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

function index_to_coords(index) {
  return {
    x: index % BOARD_WIDTH,
    y: Math.floor(index / BOARD_WIDTH)
  };
}

function empty_board() {
  const board = [];
  for (let i = 0; i < BOARD_WIDTH * BOARD_HEIGHT; i++) {
    board.push(false);

  }
  return board;
}

function addPiece(board, x, y) {
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

function movePiece(gameState, x, y) {
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

function checkFullRow(gameState, y) {
  for (let x = 0; x < BOARD_WIDTH; x++) {
    if (!gameState.board[y * BOARD_WIDTH + x]) {
      return false;
    }
  }
  return true;
}

function respawnPiece(gameState) {
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

function isPieceBelow(gameState) {
  return gameState.board[(gameState.activePiece.y + 1) * BOARD_WIDTH + gameState.activePiece.x];
}


function App() {
  const [gameState, setGameState] = useState(newGame());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gameState.activePiece.y === BOARD_HEIGHT - 1 || isPieceBelow(gameState)) {
      setGameState(respawnPiece);
      return
    }
    setGameState(movePiece(gameState, 0, 1));
  }, [tick]);

  useEffect(() => {
    const handleArrowKeys = (event) => {
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
        <div class="panel">
          <div>Score: <p class="score-value">{gameState.score}</p></div>
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

export default App;
