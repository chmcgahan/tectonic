import type { GameState, Difficulty } from './model';
import { buildRegions, checkSolved, mergeValues } from './model';
import { generate, generateLayout } from './generator';
import { LAYOUTS } from './puzzles';
import { Renderer } from './renderer';
import { InputHandler } from './input';

const renderer = new Renderer();
let currentState: GameState | null = null;

const winOverlay = document.getElementById('win-overlay')!;
const newGameBtn = document.getElementById('new-game')!;
const playAgainBtn = document.getElementById('play-again')!;
const difficultyEl = document.getElementById('difficulty') as HTMLSelectElement;

function getDifficulty(): Difficulty {
  return difficultyEl.value as Difficulty;
}

function startGame(difficulty: Difficulty): void {
  const fresh = generateLayout(5, 5);
  const layout = fresh ?? LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];
  const puzzle = generate(layout, difficulty);
  const regions = buildRegions(puzzle.regionMap, puzzle.rows, puzzle.cols);

  const given: boolean[][] = puzzle.givens.map(row => row.map(v => v !== null));
  const userValues = puzzle.givens.map(row => row.map(() => null));

  currentState = {
    puzzle,
    regions,
    userValues,
    given,
    selected: null,
    solved: false,
  };

  winOverlay.classList.add('hidden');
  renderer.buildGrid(currentState);
  inputHandler.setState(currentState);
}

function onStateChange(next: GameState): void {
  currentState = next;
  inputHandler.setState(next);

  const merged = mergeValues(next.puzzle, next.userValues);
  const solved = checkSolved(next.puzzle.rows, next.puzzle.cols, next.regions, merged);

  if (solved) {
    currentState = { ...next, solved: true };
    renderer.updateAll(currentState);
    winOverlay.classList.remove('hidden');
    return;
  }

  renderer.updateAll(currentState);
}

const inputHandler = new InputHandler(onStateChange);

newGameBtn.addEventListener('click', () => startGame(getDifficulty()));
playAgainBtn.addEventListener('click', () => startGame(getDifficulty()));

startGame('easy');
