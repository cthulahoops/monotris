import { useState, useEffect } from 'react';
import './App.css';

const TICK_INTERVAL_MS = 100;

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

type GameState = {
  board: boolean[];
  activePiece: Piece;
  score: number;
};

type Coord = {
  x: number;
  y: number;
};

type Piece = {
  position: Coord,
  blocks: Coord[]
};

type Board = boolean[];

function piece_coords(piece : Piece) : Coord[] {
  return piece.blocks.map((block) => {
    return {
      x: piece.position.x + block.x,
      y: piece.position.y + block.y
    };
  });
}

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

function fixPieceToBoard(board : Board, piece : Piece) {
  const newBoard = [...board];
  for (const block of piece_coords(piece)) {
    newBoard[block.y * BOARD_WIDTH + block.x] = true;
  }
  return newBoard;
}


function newPiece() : Piece {
  return {
    position: {
      x: Math.floor(BOARD_WIDTH / 2),
      y: 0
    },
    blocks: [
      {x: 0, y: 0},
      {x: 1, y: 0},
    ]
  };
}
function newGame() : GameState {
  return {
    board: empty_board(),
    activePiece: newPiece(),
    score: 0
  };
}

function movePiece(piece : Piece, offset : Coord) {
  return {
    ...piece,
    position: {
      x: piece.position.x + offset.x,
      y: piece.position.y + offset.y
    }
  };
}

function isOutOfBounds(coord : Coord) {
  return coord.x < 0 || coord.x >= BOARD_WIDTH || coord.y < 0 || coord.y >= BOARD_HEIGHT;
}

function isPieceColliding(board : Board, piece : Piece) {
  return piece_coords(piece).some((block) => isOutOfBounds(block) || isFilled(board, block));
}

function isFilled(board : Board, coords : Coord) {
  return board[coords.y * BOARD_WIDTH + coords.x];
}

function movePieceChecked(gameState : GameState, x : number, y : number) {
  const newPiece = movePiece(gameState.activePiece, {x, y});

  if (isPieceColliding(gameState.board, newPiece)) {
    return gameState;
  }

  return {
    ...gameState,
    activePiece: newPiece
  };
}

function checkFullRow(gameState : GameState, y : number) {
  for (let x = 0; x < BOARD_WIDTH; x++) {
    if (!isFilled(gameState.board, {x, y})) {
      return false;
    }
  }
  return true;
}

function respawnPiece(gameState : GameState) {
  const newGameState = {...gameState};
  newGameState.activePiece = newPiece();
  newGameState.board = fixPieceToBoard(gameState.board, gameState.activePiece);

  if (checkFullRow(newGameState, BOARD_HEIGHT - 1)) {
    newGameState.board.splice(BOARD_WIDTH * (BOARD_HEIGHT - 1), BOARD_WIDTH);
    for (let y = 0; y < BOARD_WIDTH; y++) {
      newGameState.board.unshift(false);
    }
    newGameState.score += 1;
  }
  return newGameState;
}


function isPieceOnGround(gameState : GameState) {
  return gameState.activePiece.position.y === BOARD_HEIGHT - 1 || isFilled(gameState.board, {x: gameState.activePiece.position.x, y: gameState.activePiece.position.y + 1});
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
    if (isPieceOnGround(gameState)) {
      setGameState(respawnPiece);
      return
    }
    setGameState(movePieceChecked(gameState, 0, 1));
  }, [tick]);

  useEffect(() => {
    const handleArrowKeys = (event : any) => {
      const keyCode = event.keyCode;
      switch (keyCode) {
        case 37: // Left arrow
          setGameState((gameState) => movePieceChecked(gameState, -1, 0));
          break;
        case 39: // Right arrow
          setGameState((gameState) => movePieceChecked(gameState, 1, 0));
          break;
        case 40: // Down arrow
          setGameState((gameState) => movePieceChecked(gameState, 0, 1));
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

  const activePieceCoords = piece_coords(gameState.activePiece);

  return (
    <div className="App">
      <h1>Monotris</h1>
      <div className="game">
        <div className="board">
        {
          gameState.board.map((value, index) => {
            const coords = index_to_coords(index);
            return <div key={index} className={value || activePieceCoords.some((piece) => piece.x == coords.x && piece.y == coords.y) ? "filled" : "empty"} />;
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
