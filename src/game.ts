import { rotateCoords, type Coord } from "./pieces";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type Board = number[];

type PieceCatalog = Coord[][];

export type Piece = {
  position: Coord;
  blocks: Coord[];
  block_type: number;
};

export type GameState = {
  board: Board;
  activePiece: Piece;
  nextPiece: Piece;
  pieceCatalog: PieceCatalog;
  score: number;
  gameOver: boolean;
};

const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };
const DOWN = { x: 0, y: 1 };

export function newGame(pieceCatalog: PieceCatalog): GameState {
  return {
    board: emptyBoard(),
    activePiece: newPiece(pieceCatalog),
    nextPiece: newPiece(pieceCatalog),
    pieceCatalog,
    score: 0,
    gameOver: false,
  };
}

export function tick(gameState: GameState): GameState {
  if (gameState.gameOver) {
    return gameState;
  }

  if (isPieceOnGround(gameState)) {
    return respawnPiece(gameState);
  }

  return movePieceChecked(gameState, DOWN);
}

export function moveLeft(gameState: GameState): GameState {
  return moveWhenRunning(gameState, LEFT);
}

export function moveRight(gameState: GameState): GameState {
  return moveWhenRunning(gameState, RIGHT);
}

export function rotate(gameState: GameState): GameState {
  if (gameState.gameOver) {
    return gameState;
  }

  return setPiece(gameState, {
    ...gameState.activePiece,
    blocks: rotateCoords(gameState.activePiece.blocks),
  });
}

export function softDrop(gameState: GameState): GameState {
  return moveWhenRunning(gameState, DOWN);
}

function moveWhenRunning(gameState: GameState, offset: Coord): GameState {
  if (gameState.gameOver) {
    return gameState;
  }

  return movePieceChecked(gameState, offset);
}

function pieceCoords(piece: Piece): Coord[] {
  return piece.blocks.map((block) => {
    return {
      x: piece.position.x + block.x,
      y: piece.position.y + block.y,
    };
  });
}

function emptyBoard(): Board {
  const board = [];
  for (let i = 0; i < BOARD_WIDTH * BOARD_HEIGHT; i++) {
    board.push(0);
  }
  return board;
}

function newPiece(pieceCatalog: PieceCatalog): Piece {
  const choice = Math.floor(Math.random() * pieceCatalog.length);
  const blocks = pieceCatalog[choice];
  const maxY = Math.max(...blocks.map((block) => block.y));

  return {
    position: {
      x: Math.floor(BOARD_WIDTH / 2),
      y: -1 - maxY,
    },
    blocks,
    block_type: choice + 1,
  };
}

function movePiece(piece: Piece, offset: Coord): Piece {
  return {
    ...piece,
    position: {
      x: piece.position.x + offset.x,
      y: piece.position.y + offset.y,
    },
  };
}

function isOutOfBounds(coord: Coord): boolean {
  return coord.x < 0 || coord.x >= BOARD_WIDTH || coord.y >= BOARD_HEIGHT;
}

function isFilled(board: Board, coords: Coord): number | boolean {
  return board[coords.y * BOARD_WIDTH + coords.x] || isOutOfBounds(coords);
}

function isPieceColliding(board: Board, piece: Piece): boolean {
  return pieceCoords(piece).some((block) => isFilled(board, block));
}

function movePieceChecked(gameState: GameState, offset: Coord): GameState {
  const activePiece = movePiece(gameState.activePiece, offset);

  if (isPieceColliding(gameState.board, activePiece)) {
    return gameState;
  }

  return {
    ...gameState,
    activePiece,
  };
}

function fixPieceToBoard(board: Board, piece: Piece): Board {
  const newBoard = [...board];

  for (const block of pieceCoords(piece)) {
    if (block.y >= 0) {
      newBoard[block.y * BOARD_WIDTH + block.x] = piece.block_type;
    }
  }

  return newBoard;
}

function isFullRow(board: Board, y: number): boolean {
  for (let x = 0; x < BOARD_WIDTH; x++) {
    if (!isFilled(board, { x, y })) {
      return false;
    }
  }

  return true;
}

function removeRow(board: Board, y: number): void {
  board.splice(BOARD_WIDTH * y, BOARD_WIDTH);
  for (let x = 0; x < BOARD_WIDTH; x++) {
    board.unshift(0);
  }
}

function respawnPiece(gameState: GameState): GameState {
  if (pieceCoords(gameState.activePiece).some((block) => block.y < 0)) {
    return {
      ...gameState,
      gameOver: true,
    };
  }

  const board = fixPieceToBoard(gameState.board, gameState.activePiece);
  let rowsCleared = 0;

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (isFullRow(board, y)) {
      removeRow(board, y);
      rowsCleared += 1;
    }
  }

  return {
    ...gameState,
    board,
    score: gameState.score + (rowsCleared * (rowsCleared + 1)) / 2,
    activePiece: gameState.nextPiece,
    nextPiece: newPiece(gameState.pieceCatalog),
  };
}

function isPieceOnGround(gameState: GameState): boolean {
  return pieceCoords(gameState.activePiece).some((pos) =>
    isFilled(gameState.board, { x: pos.x, y: pos.y + 1 }),
  );
}

function setPiece(gameState: GameState, piece: Piece): GameState {
  if (isPieceColliding(gameState.board, piece)) {
    return gameState;
  }

  return {
    ...gameState,
    activePiece: piece,
  };
}
