export const GRID_WIDTH = 5;
export const GRID_HEIGHT = 8;
export const CELL_SIZE = 60;

export interface Block {
  id: string;
  value: number;
  x: number;
  y: number;
  merging?: boolean;
  isNew?: boolean;
}

export interface GameState {
  grid: (Block | null)[][];
  currentBlock: Block | null;
  nextValue: number;
  score: number;
  highScore: number;
  gameOver: boolean;
  isPaused: boolean;
}

export const BLOCK_COLORS: Record<number, { bg: string; text: string; glow: string }> = {
  2: { bg: 'from-blue-400 to-blue-600', text: 'text-white', glow: 'shadow-blue-500/50' },
  4: { bg: 'from-cyan-400 to-cyan-600', text: 'text-white', glow: 'shadow-cyan-500/50' },
  8: { bg: 'from-emerald-400 to-emerald-600', text: 'text-white', glow: 'shadow-emerald-500/50' },
  16: { bg: 'from-green-400 to-green-600', text: 'text-white', glow: 'shadow-green-500/50' },
  32: { bg: 'from-purple-400 to-purple-600', text: 'text-white', glow: 'shadow-purple-500/50' },
  64: { bg: 'from-violet-400 to-violet-600', text: 'text-white', glow: 'shadow-violet-500/50' },
  128: { bg: 'from-amber-400 to-amber-600', text: 'text-white', glow: 'shadow-amber-500/50' },
  256: { bg: 'from-yellow-400 to-yellow-600', text: 'text-black', glow: 'shadow-yellow-500/50' },
  512: { bg: 'from-orange-400 to-orange-600', text: 'text-white', glow: 'shadow-orange-500/50' },
  1024: { bg: 'from-rose-400 to-rose-600', text: 'text-white', glow: 'shadow-rose-500/50' },
  2048: { bg: 'from-yellow-300 via-amber-400 to-yellow-500', text: 'text-black', glow: 'shadow-yellow-400/70' },
  4096: { bg: 'from-pink-400 via-rose-500 to-pink-600', text: 'text-white', glow: 'shadow-pink-500/50' },
};

export function getBlockColor(value: number) {
  return BLOCK_COLORS[value] || { bg: 'from-gray-400 to-gray-600', text: 'text-white', glow: 'shadow-gray-500/50' };
}

export function createEmptyGrid(): (Block | null)[][] {
  return Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getRandomValue(): number {
  const random = Math.random();
  if (random < 0.75) return 2;
  if (random < 0.95) return 4;
  return 8;
}

export function createNewBlock(x: number): Block {
  return {
    id: generateId(),
    value: getRandomValue(),
    x,
    y: 0,
    isNew: true,
  };
}

export function canMoveDown(grid: (Block | null)[][], block: Block): boolean {
  if (block.y >= GRID_HEIGHT - 1) return false;
  return grid[block.y + 1][block.x] === null;
}

export function canMoveLeft(grid: (Block | null)[][], block: Block): boolean {
  if (block.x <= 0) return false;
  return grid[block.y][block.x - 1] === null;
}

export function canMoveRight(grid: (Block | null)[][], block: Block): boolean {
  if (block.x >= GRID_WIDTH - 1) return false;
  return grid[block.y][block.x + 1] === null;
}

export function findMergeTarget(
  grid: (Block | null)[][],
  block: Block
): Block | null {
  // Check below
  if (block.y < GRID_HEIGHT - 1) {
    const below = grid[block.y + 1][block.x];
    if (below && below.value === block.value) {
      return below;
    }
  }
  // Check left
  if (block.x > 0) {
    const left = grid[block.y][block.x - 1];
    if (left && left.value === block.value) {
      return left;
    }
  }
  // Check right
  if (block.x < GRID_WIDTH - 1) {
    const right = grid[block.y][block.x + 1];
    if (right && right.value === block.value) {
      return right;
    }
  }
  return null;
}

export function checkGameOver(grid: (Block | null)[][]): boolean {
  // Check if top row has any blocks
  return grid[0].some(cell => cell !== null);
}

export function applyGravity(grid: (Block | null)[][]): { newGrid: (Block | null)[][]; moved: boolean } {
  const newGrid = grid.map(row => [...row]);
  let moved = false;

  for (let col = 0; col < GRID_WIDTH; col++) {
    for (let row = GRID_HEIGHT - 2; row >= 0; row--) {
      const block = newGrid[row][col];
      if (block) {
        let targetRow = row;
        while (targetRow < GRID_HEIGHT - 1 && newGrid[targetRow + 1][col] === null) {
          targetRow++;
        }
        if (targetRow !== row) {
          newGrid[targetRow][col] = { ...block, y: targetRow };
          newGrid[row][col] = null;
          moved = true;
        }
      }
    }
  }

  return { newGrid, moved };
}

export function findAndMerge(grid: (Block | null)[][]): { 
  newGrid: (Block | null)[][]; 
  merged: boolean; 
  scoreGained: number;
  mergedPositions: { x: number; y: number }[];
} {
  const newGrid = grid.map(row => [...row]);
  let merged = false;
  let scoreGained = 0;
  const mergedPositions: { x: number; y: number }[] = [];
  const processed = new Set<string>();

  // Check all blocks for potential merges (bottom to top, left to right)
  for (let row = GRID_HEIGHT - 1; row >= 0; row--) {
    for (let col = 0; col < GRID_WIDTH; col++) {
      const block = newGrid[row][col];
      if (!block || processed.has(`${row}-${col}`)) continue;

      // Check below
      if (row < GRID_HEIGHT - 1) {
        const below = newGrid[row + 1][col];
        if (below && below.value === block.value && !processed.has(`${row + 1}-${col}`)) {
          // Merge into below
          newGrid[row + 1][col] = {
            ...below,
            value: below.value * 2,
            merging: true,
          };
          newGrid[row][col] = null;
          scoreGained += below.value * 2;
          merged = true;
          mergedPositions.push({ x: col, y: row + 1 });
          processed.add(`${row}-${col}`);
          processed.add(`${row + 1}-${col}`);
          continue;
        }
      }

      // Check right (horizontal merges)
      if (col < GRID_WIDTH - 1) {
        const right = newGrid[row][col + 1];
        if (right && right.value === block.value && !processed.has(`${row}-${col + 1}`)) {
          // Merge into current
          newGrid[row][col] = {
            ...block,
            value: block.value * 2,
            merging: true,
          };
          newGrid[row][col + 1] = null;
          scoreGained += block.value * 2;
          merged = true;
          mergedPositions.push({ x: col, y: row });
          processed.add(`${row}-${col}`);
          processed.add(`${row}-${col + 1}`);
        }
      }
    }
  }

  return { newGrid, merged, scoreGained, mergedPositions };
}

export function getHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem('falling2048_highScore');
  return stored ? parseInt(stored, 10) : 0;
}

export function setHighScore(score: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('falling2048_highScore', score.toString());
}
