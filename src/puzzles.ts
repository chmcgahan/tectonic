import type { PuzzleLayout } from './model';

// Verified solvable 5×5 region layouts (generated and solver-confirmed).
// Region IDs are arbitrary integers; equal IDs = same region.
// All regions are orthogonally connected with size ≥ 3.
export const LAYOUTS: PuzzleLayout[] = [
  {
    rows: 5, cols: 5,
    regionMap: [
      [1, 1, 1, 2, 5],
      [1, 1, 2, 2, 5],
      [3, 2, 2, 4, 5],
      [3, 0, 0, 4, 4],
      [3, 0, 0, 4, 4],
    ],
  },
  {
    rows: 5, cols: 5,
    regionMap: [
      [5, 2, 2, 2, 4],
      [5, 5, 2, 2, 4],
      [5, 3, 3, 3, 4],
      [1, 1, 3, 0, 0],
      [1, 1, 0, 0, 0],
    ],
  },
  {
    rows: 5, cols: 5,
    regionMap: [
      [4, 4, 4, 2, 2],
      [1, 1, 4, 2, 2],
      [1, 1, 0, 0, 2],
      [1, 0, 0, 3, 3],
      [5, 5, 5, 3, 3],
    ],
  },
  {
    rows: 5, cols: 5,
    regionMap: [
      [4, 4, 2, 3, 3],
      [4, 4, 2, 2, 3],
      [0, 2, 2, 1, 1],
      [0, 0, 1, 1, 1],
      [0, 0, 5, 5, 5],
    ],
  },
];
