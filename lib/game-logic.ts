export type Difficulty = "easy" | "medium" | "hard";

export interface DifficultyConfig {
  gridWidth: number;
  gridHeight: number;
  fallSpeed: number;
  fastFallSpeed: number;
  blockValues: number[];
  blockWeights: number[];
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    gridWidth: 5,
    gridHeight: 8,
    fallSpeed: 1000,
    fastFallSpeed: 80,
    blockValues: [2, 4],
    blockWeights: [0.8, 1.0],
  },
  medium: {
    gridWidth: 5,
    gridHeight: 10,
    fallSpeed: 700,
    fastFallSpeed: 50,
    blockValues: [2, 4, 8],
    blockWeights: [0.6, 0.9, 1.0],
  },
  hard: {
    gridWidth: 6,
    gridHeight: 12,
    fallSpeed: 450,
    fastFallSpeed: 30,
    blockValues: [2, 4, 8, 16],
    blockWeights: [0.45, 0.75, 0.92, 1.0],
  },
};

export const CELL_SIZE = 56;

const GRID_WIDTH = 6; // Declared GRID_WIDTH
const GRID_HEIGHT = 12; // Declared GRID_HEIGHT

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
  difficulty: Difficulty;
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

export function createEmptyGrid(difficulty: Difficulty): (Block | null)[][] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  return Array(config.gridHeight).fill(null).map(() => Array(config.gridWidth).fill(null));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getRandomValue(difficulty: Difficulty): number {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const random = Math.random();
  
  for (let i = 0; i < config.blockWeights.length; i++) {
    if (random < config.blockWeights[i]) {
      return config.blockValues[i];
    }
  }
  return config.blockValues[config.blockValues.length - 1];
}

export function createNewBlock(x: number, difficulty: Difficulty): Block {
  return {
    id: generateId(),
    value: getRandomValue(difficulty),
    x,
    y: 0,
    isNew: true,
  };
}

export function canMoveDown(grid: (Block | null)[][], block: Block, difficulty: Difficulty): boolean {
  const config = DIFFICULTY_CONFIGS[difficulty];
  if (block.y >= config.gridHeight - 1) return false;
  return grid[block.y + 1][block.x] === null;
}

export function canMoveLeft(grid: (Block | null)[][], block: Block): boolean {
  if (block.x <= 0) return false;
  return grid[block.y][block.x - 1] === null;
}

export function canMoveRight(grid: (Block | null)[][], block: Block, difficulty: Difficulty): boolean {
  const config = DIFFICULTY_CONFIGS[difficulty];
  if (block.x >= config.gridWidth - 1) return false;
  return grid[block.y][block.x + 1] === null;
}

export function findMergeTarget(
  grid: (Block | null)[][],
  block: Block
): Block | null {
  const gridHeight = grid.length;
  const gridWidth = grid[0]?.length || 0;
  
  // Check below
  if (block.y < gridHeight - 1) {
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
  if (block.x < gridWidth - 1) {
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
  const gridHeight = grid.length;
  const gridWidth = grid[0]?.length || 0;

  for (let col = 0; col < gridWidth; col++) {
    for (let row = gridHeight - 2; row >= 0; row--) {
      const block = newGrid[row][col];
      if (block) {
        let targetRow = row;
        while (targetRow < gridHeight - 1 && newGrid[targetRow + 1][col] === null) {
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
  const gridHeight = grid.length;
  const gridWidth = grid[0]?.length || 0;

  // Check all blocks for potential merges (bottom to top, left to right)
  for (let row = gridHeight - 1; row >= 0; row--) {
    for (let col = 0; col < gridWidth; col++) {
      const block = newGrid[row][col];
      if (!block || processed.has(`${row}-${col}`)) continue;

      // Check below
      if (row < gridHeight - 1) {
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
      if (col < gridWidth - 1) {
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

export function getHighScore(difficulty: Difficulty): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(`falling2048_highScore_${difficulty}`);
  return stored ? parseInt(stored, 10) : 0;
}

export function getAllHighScores(): Record<Difficulty, number> {
  return {
    easy: getHighScore('easy'),
    medium: getHighScore('medium'),
    hard: getHighScore('hard'),
  };
}

export function setHighScore(score: number, difficulty: Difficulty): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`falling2048_highScore_${difficulty}`, score.toString());
}
