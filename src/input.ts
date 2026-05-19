import type { GameState } from './model';
import { regionOfCell } from './model';

export type StateCallback = (state: GameState) => void;

export class InputHandler {
  private state: GameState | null = null;
  private readonly onChange: StateCallback;

  constructor(onChange: StateCallback) {
    this.onChange = onChange;
    this.bindGrid();
    this.bindNumpad();
    this.bindKeyboard();
  }

  setState(state: GameState): void {
    this.state = state;
  }

  private bindGrid(): void {
    document.getElementById('grid')!.addEventListener('click', e => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('.cell');
      if (!target || !this.state) return;
      const r = Number(target.dataset.row);
      const c = Number(target.dataset.col);
      this.select(r, c);
    });
  }

  private bindNumpad(): void {
    document.getElementById('numpad')!.addEventListener('click', e => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('.numpad-btn');
      if (!target || !this.state) return;
      const v = Number(target.dataset.value);
      this.enter(v === 0 ? null : v);
    });
  }

  private bindKeyboard(): void {
    document.addEventListener('keydown', e => {
      if (!this.state) return;
      if (e.key >= '1' && e.key <= '9') {
        this.enter(Number(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        this.enter(null);
      } else if (e.key === 'ArrowUp')    this.move(-1,  0);
        else if (e.key === 'ArrowDown')  this.move( 1,  0);
        else if (e.key === 'ArrowLeft')  this.move( 0, -1);
        else if (e.key === 'ArrowRight') this.move( 0,  1);
    });
  }

  private select(r: number, c: number): void {
    if (!this.state) return;
    this.onChange({ ...this.state, selected: [r, c] });
  }

  private enter(v: number | null): void {
    if (!this.state || this.state.solved) return;
    const sel = this.state.selected;
    if (!sel) return;
    const [r, c] = sel;
    if (this.state.given[r][c]) return;

    if (v !== null) {
      const region = regionOfCell(this.state.regions, r, c);
      if (v > region.size) return;
    }

    const userValues = this.state.userValues.map(row => [...row]);
    userValues[r][c] = v;
    this.onChange({ ...this.state, userValues });
  }

  private move(dr: number, dc: number): void {
    if (!this.state) return;
    const sel = this.state.selected;
    if (!sel) return;
    const nr = sel[0] + dr, nc = sel[1] + dc;
    if (nr >= 0 && nr < this.state.puzzle.rows && nc >= 0 && nc < this.state.puzzle.cols)
      this.select(nr, nc);
  }
}
