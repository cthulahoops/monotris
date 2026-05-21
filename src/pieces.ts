export type Coord = {
  x: number;
  y: number;
};

const PIECES: { [key: number]: Coord[][] } = {};

export function getPieces(n: number): Coord[][] {
  if (!PIECES[n]) {
    PIECES[n] = generatePieces(n);
  }

  return PIECES[n];
}

export function generatePieces(n: number): Coord[][] {
  let shapes: Coord[][] = [[{ x: 0, y: 0 }]];

  for (let size = 2; size <= n; size++) {
    const next = new Map<string, Coord[]>();

    for (const shape of shapes) {
      for (const block of shape) {
        for (const dir of CARDINAL_DIRECTIONS) {
          const added = {
            x: block.x + dir.x,
            y: block.y + dir.y,
          };

          if (containsCoord(shape, added)) {
            continue;
          }

          const candidate = [...shape, added];
          const key = canonicalKey(candidate);

          if (!next.has(key)) {
            next.set(key, deserializeKey(key));
          }
        }
      }
    }

    shapes = Array.from(next.values());
  }

  return shapes.map(alignCoords);
}

export function rotateCoords(coords: Coord[]): Coord[] {
  return coords.map((coord) => {
    return {
      x: -coord.y,
      y: coord.x,
    };
  });
}

const CARDINAL_DIRECTIONS: Coord[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function canonicalKey(shape: Coord[]): string {
  return rotations(shape).map(normalize).map(serialize).sort()[0];
}

function rotations(shape: Coord[]): Coord[][] {
  const result: Coord[][] = [];
  let current = shape;

  for (let i = 0; i < 4; i++) {
    result.push(current);
    current = rotateCoords(current);
  }

  return result;
}

function normalize(shape: Coord[]): Coord[] {
  const minX = Math.min(...shape.map((coord) => coord.x));
  const minY = Math.min(...shape.map((coord) => coord.y));

  return shape
    .map((coord) => {
      return {
        x: coord.x - minX,
        y: coord.y - minY,
      };
    })
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

function serialize(shape: Coord[]): string {
  return shape.map((coord) => `${coord.x},${coord.y}`).join(";");
}

function deserializeKey(key: string): Coord[] {
  return key.split(";").map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return { x, y };
  });
}

function containsCoord(shape: Coord[], coord: Coord): boolean {
  return shape.some((block) => block.x === coord.x && block.y === coord.y);
}

function alignCoords(coords: Coord[]): Coord[] {
  const maxX = Math.max(...coords.map((coord) => coord.x));
  const maxY = Math.max(...coords.map((coord) => coord.y));
  const centered = coords.map((coord) => {
    return {
      x: coord.x - Math.floor(maxX / 2),
      y: coord.y - Math.floor(maxY / 2),
    };
  });

  if (maxY > maxX) {
    return rotateCoords(centered);
  }
  return centered;
}
