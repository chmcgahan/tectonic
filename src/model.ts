export type RegionMap = number[][];
export type Values = (number | null)[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Region {
  readonly id: number;
  readonly size: number;
  readonly cells: ReadonlyArray<readonly [number, number]>;
}

export interface PuzzleLayout {
  readonly rows: number;
  readonly cols: number;
  readonly regionMap: RegionMap;
}

export interface Puzzle extends PuzzleLayout {
  readonly givens: Values;
}

export interface GameState {
  readonly puzzle: Puzzle;
  readonly regions: readonly Region[];
  readonly userValues: Values;
  readonly given: boolean[][];
  readonly selected: readonly [number, number] | null;
  readonly solved: boolean;
}

export function buildRegions(regionMap: RegionMap, rows: number, cols: number): Region[] {
  const map = new Map<number, Array<[number, number]>>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = regionMap[r][c];
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push([r, c]);
    }
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([id, cells]) => ({ id, size: cells.length, cells }));
}

export function regionOfCell(
  regions: readonly Region[],
  r: number,
  c: number
): Region {
  return regions.find(reg => reg.cells.some(([rr, cc]) => rr === r && cc === c))!;
}

export function checkSolved(
  rows: number,
  cols: number,
  regions: readonly Region[],
  values: Values
): boolean {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (values[r][c] === null) return false;

  for (const region of regions) {
    const seen = new Set<number>();
    for (const [r, c] of region.cells) {
      const v = values[r][c]!;
      if (v < 1 || v > region.size || seen.has(v)) return false;
      seen.add(v);
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = values[r][c]!;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && values[nr][nc] === v)
            return false;
        }
      }
    }
  }

  return true;
}

export function mergeValues(puzzle: Puzzle, userValues: Values): Values {
  return puzzle.givens.map((row, r) =>
    row.map((v, c) => (v !== null ? v : userValues[r][c]))
  );
}
