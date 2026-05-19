import { buildRegions } from './model';
import type { RegionMap, Region, Values } from './model';

function buildRegionById(regions: Region[]): Map<number, Region> {
  return new Map(regions.map(r => [r.id, r]));
}

function getLegal(
  r: number,
  c: number,
  rows: number,
  cols: number,
  regionMap: RegionMap,
  regionById: Map<number, Region>,
  values: Values
): number[] {
  const region = regionById.get(regionMap[r][c])!;
  const used = new Set<number>();

  for (const [rr, rc] of region.cells) {
    const v = values[rr][rc];
    if (v !== null) used.add(v);
  }

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const v = values[nr][nc];
        if (v !== null) used.add(v);
      }
    }
  }

  const legal: number[] = [];
  for (let v = 1; v <= region.size; v++) {
    if (!used.has(v)) legal.push(v);
  }
  return legal;
}

// Returns up to `maxSolutions` complete solution grids.
export function solve(
  rows: number,
  cols: number,
  regionMap: RegionMap,
  initial: Values,
  maxSolutions = 1
): number[][][] {
  const regions = buildRegions(regionMap, rows, cols);
  const regionById = buildRegionById(regions);
  const values: Values = initial.map(row => [...row]);
  const solutions: number[][][] = [];

  function bt(): boolean {
    let bestR = -1, bestC = -1, bestLen = Infinity;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (values[r][c] !== null) continue;
        const legal = getLegal(r, c, rows, cols, regionMap, regionById, values);
        if (legal.length === 0) return false;
        if (legal.length < bestLen) {
          bestLen = legal.length;
          bestR = r;
          bestC = c;
        }
      }
    }

    if (bestR === -1) {
      solutions.push(values.map(row => [...row]) as number[][]);
      return solutions.length >= maxSolutions;
    }

    const legal = getLegal(bestR, bestC, rows, cols, regionMap, regionById, values);
    for (const v of legal) {
      values[bestR][bestC] = v;
      if (bt()) return true;
      values[bestR][bestC] = null;
    }
    return false;
  }

  bt();
  return solutions;
}

export function solveOne(rows: number, cols: number, regionMap: RegionMap): number[][] | null {
  const empty: Values = Array.from({ length: rows }, () => Array(cols).fill(null));
  return solve(rows, cols, regionMap, empty, 1)[0] ?? null;
}

export function hasUniqueSolution(
  rows: number,
  cols: number,
  regionMap: RegionMap,
  givens: Values
): boolean {
  return solve(rows, cols, regionMap, givens, 2).length === 1;
}
