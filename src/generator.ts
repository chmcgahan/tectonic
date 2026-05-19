import type { PuzzleLayout, Puzzle, Difficulty, Values } from './model';
import { solveOne, hasUniqueSolution } from './solver';

const DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

// Generates a random orthogonally-connected region layout.
// Returns null if it couldn't build a valid layout after many tries
// (rare; caller should fall back to a pre-built layout).
export function generateLayout(rows: number, cols: number, minSize = 3, maxSize = 5): PuzzleLayout | null {
  for (let attempt = 0; attempt < 400; attempt++) {
    const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(-1));
    let id = 0;
    let valid = true;

    while (true) {
      const empty: [number, number][] = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (grid[r][c] === -1) empty.push([r, c]);
      if (empty.length === 0) break;
      if (empty.length < minSize) { valid = false; break; }

      const [sr, sc] = empty[Math.floor(Math.random() * empty.length)];
      const target = Math.min(empty.length, minSize + Math.floor(Math.random() * (maxSize - minSize + 1)));
      grid[sr][sc] = id;
      const region: [number, number][] = [[sr, sc]];

      for (let t = 0; region.length < target && t < 300; t++) {
        const borders: [number, number][] = [];
        for (const [r, c] of region)
          for (const [dr, dc] of DIRS) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === -1)
              borders.push([nr, nc]);
          }
        if (borders.length === 0) break;
        const [nr, nc] = borders[Math.floor(Math.random() * borders.length)];
        grid[nr][nc] = id;
        region.push([nr, nc]);
      }
      id++;
    }

    if (!valid) continue;
    const layout: PuzzleLayout = { rows, cols, regionMap: grid };
    if (solveOne(rows, cols, grid) !== null) return layout;
  }
  return null;
}

const TARGET_RATIO: Record<Difficulty, number> = {
  easy: 0.55,
  medium: 0.40,
  hard: 0.28,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generate(layout: PuzzleLayout, difficulty: Difficulty): Puzzle {
  const { rows, cols, regionMap } = layout;

  const solution = solveOne(rows, cols, regionMap);
  if (!solution) throw new Error('Layout has no valid solution');

  const given: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(true));
  const total = rows * cols;
  const target = Math.floor(total * TARGET_RATIO[difficulty]);

  const positions = shuffle(
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c): [number, number] => [r, c])
    ).flat()
  );

  let filled = total;

  for (const [r, c] of positions) {
    if (filled <= target) break;

    given[r][c] = false;

    const currentGivens: Values = solution.map((row, ri) =>
      row.map((v, ci) => (given[ri][ci] ? v : null))
    );

    if (!hasUniqueSolution(rows, cols, regionMap, currentGivens)) {
      given[r][c] = true;
    } else {
      filled--;
    }
  }

  const givens: Values = solution.map((row, r) =>
    row.map((v, c) => (given[r][c] ? v : null))
  );

  return { rows, cols, regionMap, givens };
}
