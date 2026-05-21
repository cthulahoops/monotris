import { useState, useEffect, CSSProperties } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "./App.css";

import { useGameClock, useEventListener } from "./hooks";
import {
  BOARD_WIDTH,
  moveLeft,
  moveRight,
  newGame,
  rotate,
  softDrop,
  tick as tickGame,
  type Board,
  type GameState,
  type Piece,
} from "./game";
import { getPieces, type Coord } from "./pieces";

interface CustomCSS extends CSSProperties {
  "--block-hue": number;
}

const TITLES: { [key: number]: string } = {
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

function getNtris(): number {
  const params = new URLSearchParams(window.location.search);
  const paramValue = Number(params.get("n"));
  if (Number.isInteger(paramValue) && paramValue >= 1 && paramValue <= 10) {
    return paramValue;
  }

  const hostname = window.location.hostname.split(".")[0];
  for (let i = 1; i <= 10; i++) {
    if (hostname === TITLES[i].toLowerCase()) {
      return i;
    }
  }

  return 1;
}

const TICK_INTERVAL_MS = 300;
const NTRIS = getNtris();

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_UP = 38;
const KEY_DOWN = 40;

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

function Game() {
  const pieceCatalog = getPieces(NTRIS);
  const [gameState, setGameState] = useState<GameState>(() =>
    newGame(pieceCatalog),
  );
  const tick = useGameClock(TICK_INTERVAL_MS);

  useEffect(() => {
    setGameState((gameState) => tickGame(gameState));
  }, [tick]);

  useEventListener("keydown", (event: KeyboardEvent) => {
    setGameState((gameState) => {
      switch (event.keyCode) {
        case KEY_LEFT:
          return moveLeft(gameState);
        case KEY_RIGHT:
          return moveRight(gameState);
        case KEY_UP:
          return rotate(gameState);
        case KEY_DOWN:
          return softDrop(gameState);
        default:
          return gameState;
      }
    });
  });

  return (
    <div className="game">
      <Board board={gameState.board} activePiece={gameState.activePiece} />
      <div className="panel">
        <div>
          Score: <p className="score-value">{gameState.score}</p>
          {gameState.gameOver ? <p>Game Over</p> : null}
        </div>
        <div>
          Next Block:
          <Preview piece={gameState.nextPiece} pieceCount={pieceCatalog.length} />
        </div>
        <div>
          <button onClick={() => setGameState(newGame(pieceCatalog))}>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}

function Preview({
  piece,
  pieceCount,
}: {
  piece: Piece;
  pieceCount: number;
}) {
  return (
    <div className="preview">
      {piece.blocks.map((block, index) => {
        return (
          <Block
            key={index}
            position={{ x: block.x + 1, y: block.y + 1 }}
            block_type={piece.block_type}
            pieceCount={pieceCount}
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
  const pieceCount = getPieces(NTRIS).length;

  return (
    <div className="board">
      {board.map((value, index) => {
        if (!value) {
          return;
        }
        const coords = index_to_coords(index);
        return (
          <Block
            key={index}
            position={coords}
            block_type={value}
            pieceCount={pieceCount}
          />
        );
      })}

      {activePieceCoords
        .filter((block) => block.y >= 0)
        .map((block, index) => {
          return (
            <Block
              key={index + 1000}
              position={block}
              block_type={activePiece.block_type}
              pieceCount={pieceCount}
            />
          );
        })}
    </div>
  );
}

type BlockProps = {
  position: Coord;
  block_type: number;
  pieceCount: number;
};

function Block({ position, block_type, pieceCount }: BlockProps) {
  return (
    <div
      style={
        {
          gridColumn: position.x + 1,
          gridRow: position.y + 1,
          "--block-hue": ((block_type - 1) / pieceCount) * 360,
        } as CustomCSS
      }
      className="filled"
    />
  );
}

export default function App() {
  const title = TITLES[NTRIS];
  return (
    <HelmetProvider>
      <div className="App">
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <h1>{title}</h1>
        <Game />
        <div className="footer">
          <a href="https://github.com/cthulahoops/monotris/">Github</a>
        </div>
      </div>
    </HelmetProvider>
  );
}
