import { useState, useEffect } from "react";
import "./App.css";

import { useGameClock, useEventListener } from "./hooks";

const TICK_INTERVAL_MS = 100;

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const NTRIS = 2;

const TITLES = {
  1: "Monotris",
  2: "Ditris",
  3: "Tritris",
  4: "Tetris",
  5: "Pentris",
  6: "Hextris",
  7: "Heptis",
  8: "Octris",
  9: "Nontris",
  10: "Decatris",
};

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
  position: Coord;
  blocks: Coord[];
};

type Board = boolean[];

function rotatePiece(piece: Piece) {
  const newBlocks = piece.blocks.map((block) => {
    return {
      x: block.y,
      y: -block.x,
    };
  });
  return {
    ...piece,
    blocks: newBlocks,
  };
}

function piece_coords(piece: Piece): Coord[] {
  return piece.blocks.map((block) => {
    return {
      x: piece.position.x + block.x,
      y: piece.position.y + block.y,
    };
  });
}

function index_to_coords(index: number): Coord {
  return {
    x: index % BOARD_WIDTH,
    y: Math.floor(index / BOARD_WIDTH),
  };
}

function empty_board(): Board {
  const board = [];
  for (let i = 0; i < BOARD_WIDTH * BOARD_HEIGHT; i++) {
    board.push(false);
  }
  return board;
}

function fixPieceToBoard(board: Board, piece: Piece) {
  const newBoard = [...board];
  for (const block of piece_coords(piece)) {
    newBoard[block.y * BOARD_WIDTH + block.x] = true;
  }
  return newBoard;
}

function newPiece(): Piece {
  return {
    position: {
      x: Math.floor(BOARD_WIDTH / 2),
      y: 0,
    },
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
  };
}
function newGame(): GameState {
  return {
    board: empty_board(),
    activePiece: newPiece(),
    score: 0,
  };
}

function movePiece(piece: Piece, offset: Coord) {
  return {
    ...piece,
    position: {
      x: piece.position.x + offset.x,
      y: piece.position.y + offset.y,
    },
  };
}

function isOutOfBounds(coord: Coord) {
  return (
    coord.x < 0 ||
    coord.x >= BOARD_WIDTH ||
    coord.y < 0 ||
    coord.y >= BOARD_HEIGHT
  );
}

function isPieceColliding(board: Board, piece: Piece) {
  return piece_coords(piece).some((block) => isFilled(board, block));
}

function isFilled(board: Board, coords: Coord) {
  return board[coords.y * BOARD_WIDTH + coords.x] || isOutOfBounds(coords);
}

function movePieceChecked(gameState: GameState, offset: Coord) {
  const newPiece = movePiece(gameState.activePiece, offset);

  if (isPieceColliding(gameState.board, newPiece)) {
    return gameState;
  }

  return {
    ...gameState,
    activePiece: newPiece,
  };
}

function isFullRow(gameState: GameState, y: number) {
  for (let x = 0; x < BOARD_WIDTH; x++) {
    if (!isFilled(gameState.board, { x, y })) {
      return false;
    }
  }
  return true;
}

function removeRow(board: Board, y: number) {
  board.splice(BOARD_WIDTH * y, BOARD_WIDTH);
  for (let x = 0; x < BOARD_WIDTH; x++) {
    board.unshift(false);
  }
}

function respawnPiece(gameState: GameState) {
  const newGameState = { ...gameState };
  newGameState.activePiece = newPiece();
  newGameState.board = fixPieceToBoard(gameState.board, gameState.activePiece);

  let rowsCleared = 0;

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (isFullRow(newGameState, y)) {
      removeRow(newGameState.board, y);
      rowsCleared += 1;
    }
  }

  newGameState.score += (rowsCleared * (rowsCleared + 1)) / 2;

  return newGameState;
}

function isPieceOnGround(gameState: GameState) {
  return piece_coords(gameState.activePiece).some((pos) =>
    isFilled(gameState.board, { x: pos.x, y: pos.y + 1 }),
  );
}

function setPiece(gameState: GameState, piece: Piece) {
  if (isPieceColliding(gameState.board, piece)) {
    return gameState;
  }
  return {
    ...gameState,
    activePiece: piece,
  };
}

const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };
const DOWN = { x: 0, y: 1 };

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_UP = 38;
const KEY_DOWN = 40;

function handleInput(gameState: GameState, keyCode: number): GameState {
  switch (keyCode) {
    case KEY_LEFT:
      return movePieceChecked(gameState, LEFT);
    case KEY_RIGHT:
      return movePieceChecked(gameState, RIGHT);
      break;
    case KEY_UP:
      return setPiece(gameState, rotatePiece(gameState.activePiece));
    case KEY_DOWN:
      return movePieceChecked(gameState, DOWN);
    default:
      return gameState;
  }
}

function handleTick(gameState: GameState): GameState {
  if (isPieceOnGround(gameState)) {
    return respawnPiece(gameState);
  }
  return movePieceChecked(gameState, DOWN);
}

function Game() {
  const [gameState, setGameState] = useState<GameState>(newGame());
  const tick = useGameClock(TICK_INTERVAL_MS);

  useEffect(() => {
    setGameState((gameState) => handleTick(gameState));
  }, [tick]);

  useEventListener("keydown", (event: any) => {
    setGameState((gameState) => handleInput(gameState, event.keyCode));
  });

  return (
    <div className="game">
      <Board board={gameState.board} activePiece={gameState.activePiece} />
      <div className="panel">
        <div>
          Score: <p className="score-value">{gameState.score}</p>
        </div>
        <div>
          Next Block:
          <Preview piece={gameState.activePiece} />
        </div>
        <div>
          <button onClick={() => setGameState(newGame)}>New Game</button>
        </div>
      </div>
    </div>
  );
}

function Preview({ piece }: { piece: Piece }) {
  return (
    <div className="preview">
      {piece.blocks.map((block, index) => {
        return (
          <div
            key={index}
            style={{
              gridRow: block.y + 1,
              gridColumn: block.x + 1,
            }}
            className="filled"
          />
        );
      })}
    </div>
  );
}

type BoardProps = {
  board: Board;
  activePiece: Piece;
};

function Board({ board, activePiece }: BoardProps) {
  const activePieceCoords = piece_coords(activePiece);

  return (
    <div className="board">
      {board.map((value, index) => {
        const coords = index_to_coords(index);
        return (
          <div
            key={index}
            className={
              value ||
              activePieceCoords.some(
                (piece) => piece.x == coords.x && piece.y == coords.y,
              )
                ? "filled"
                : "empty"
            }
          />
        );
      })}
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <h1>{TITLES[NTRIS]}</h1>
      <Game />
      <div className="footer">
        <a href="https://github.com/cthulahoops/monotris/">Github</a>
      </div>
    </div>
  );
}
