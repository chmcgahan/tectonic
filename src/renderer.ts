import type { GameState, Region } from './model';

const THICK = '3px solid #374151';
const THIN = '1px solid #d1d5db';

export class Renderer {
  private readonly gridEl: HTMLElement;
  private readonly numpadEl: HTMLElement;
  private cellEls: HTMLElement[][] = [];

  constructor() {
    this.gridEl = document.getElementById('grid')!;
    this.numpadEl = document.getElementById('numpad')!;
  }

  buildGrid(state: GameState): void {
    const { rows, cols, regionMap } = state.puzzle;
    this.gridEl.innerHTML = '';
    this.gridEl.style.gridTemplateColumns = `repeat(${cols}, 56px)`;
    this.cellEls = Array.from({ length: rows }, () => Array(cols));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = document.createElement('div');
        el.className = 'cell';
        el.dataset.row = String(r);
        el.dataset.col = String(c);
        this.applyBorders(el, r, c, rows, cols, regionMap);
        const span = document.createElement('span');
        el.appendChild(span);
        this.gridEl.appendChild(el);
        this.cellEls[r][c] = el;
      }
    }

    this.buildNumpad(state.regions);
    this.updateAll(state);
  }

  updateAll(state: GameState): void {
    const { rows, cols } = state.puzzle;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        this.updateCell(r, c, state);
  }

  updateCell(r: number, c: number, state: GameState): void {
    const el = this.cellEls[r]?.[c];
    if (!el) return;

    const { puzzle, userValues, given, selected } = state;
    const isGiven = given[r][c];
    const val = isGiven ? puzzle.givens[r][c] : userValues[r][c];
    const isSelected = selected !== null && selected[0] === r && selected[1] === c;
    const isSameRegion =
      selected !== null &&
      !isSelected &&
      puzzle.regionMap[r][c] === puzzle.regionMap[selected[0]][selected[1]];

    el.className =
      'cell' +
      (isGiven ? ' given' : '') +
      (isSelected ? ' selected' : '') +
      (isSameRegion ? ' same-region' : '');

    el.querySelector('span')!.textContent = val !== null ? String(val) : '';
  }

  private applyBorders(
    el: HTMLElement,
    r: number,
    c: number,
    rows: number,
    cols: number,
    regionMap: number[][]
  ): void {
    const rid = regionMap[r][c];
    el.style.borderTop = r === 0 || regionMap[r - 1][c] !== rid ? THICK : THIN;
    el.style.borderLeft = c === 0 || regionMap[r][c - 1] !== rid ? THICK : THIN;
    // Right and bottom only drawn by last-col / last-row cells to avoid doubling
    if (c === cols - 1) el.style.borderRight = THICK;
    if (r === rows - 1) el.style.borderBottom = THICK;
    // Mid cells also need right/bottom when crossing a region boundary
    if (c < cols - 1) el.style.borderRight = regionMap[r][c + 1] !== rid ? THICK : THIN;
    if (r < rows - 1) el.style.borderBottom = regionMap[r + 1][c] !== rid ? THICK : THIN;
  }

  private buildNumpad(regions: readonly Region[]): void {
    const maxSize = Math.max(...regions.map(r => r.size));
    this.numpadEl.innerHTML = '';

    for (let v = 1; v <= maxSize; v++) {
      const btn = document.createElement('button');
      btn.className = 'numpad-btn';
      btn.dataset.value = String(v);
      btn.textContent = String(v);
      this.numpadEl.appendChild(btn);
    }

    const clearBtn = document.createElement('button');
    clearBtn.className = 'numpad-btn numpad-clear';
    clearBtn.dataset.value = '0';
    clearBtn.textContent = '✕';
    this.numpadEl.appendChild(clearBtn);
  }
}
