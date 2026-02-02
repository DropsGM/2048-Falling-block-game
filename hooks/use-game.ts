"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  type Block,
  type GameState,
  GRID_WIDTH,
  GRID_HEIGHT,
  createEmptyGrid,
  createNewBlock,
  canMoveDown,
  canMoveLeft,
  canMoveRight,
  applyGravity,
  findAndMerge,
  checkGameOver,
  getHighScore,
  setHighScore,
  getRandomValue,
  generateId,
} from "@/lib/game-logic";

const FALL_SPEED = 800; // ms between automatic falls
const FAST_FALL_SPEED = 50; // ms when holding down

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: createEmptyGrid(),
    currentBlock: null,
    nextValue: getRandomValue(),
    score: 0,
    highScore: 0,
    gameOver: false,
    isPaused: false,
  }));

  const [isFastFalling, setIsFastFalling] = useState(false);
  const fallIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

  // Load high score on mount
  useEffect(() => {
    setGameState((prev) => ({ ...prev, highScore: getHighScore() }));
  }, []);

  // Spawn a new block
  const spawnBlock = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameOver || prev.isPaused) return prev;

      const spawnX = Math.floor(GRID_WIDTH / 2);

      // Check if spawn position is blocked
      if (prev.grid[0][spawnX] !== null) {
        const newHighScore = Math.max(prev.score, prev.highScore);
        setHighScore(newHighScore);
        return { ...prev, gameOver: true, highScore: newHighScore };
      }

      const newBlock: Block = {
        id: generateId(),
        value: prev.nextValue,
        x: spawnX,
        y: 0,
        isNew: true,
      };

      return {
        ...prev,
        currentBlock: newBlock,
        nextValue: getRandomValue(),
      };
    });
  }, []);

  // Process merges and gravity
  const processMergesAndGravity = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    const process = () => {
      setGameState((prev) => {
        // First apply gravity
        const { newGrid: gravityGrid, moved: gravityMoved } = applyGravity(
          prev.grid
        );

        if (gravityMoved) {
          setTimeout(process, 100);
          return { ...prev, grid: gravityGrid };
        }

        // Then check for merges
        const { newGrid: mergeGrid, merged, scoreGained } =
          findAndMerge(gravityGrid);

        if (merged) {
          const newScore = prev.score + scoreGained;
          const newHighScore = Math.max(newScore, prev.highScore);
          if (newScore > prev.highScore) {
            setHighScore(newHighScore);
          }
          setTimeout(process, 150);
          return {
            ...prev,
            grid: mergeGrid,
            score: newScore,
            highScore: newHighScore,
          };
        }

        // Check game over
        if (checkGameOver(mergeGrid)) {
          const newHighScore = Math.max(prev.score, prev.highScore);
          setHighScore(newHighScore);
          processingRef.current = false;
          return { ...prev, grid: mergeGrid, gameOver: true, highScore: newHighScore };
        }

        processingRef.current = false;
        return { ...prev, grid: mergeGrid };
      });
    };

    process();
  }, []);

  // Place current block on grid
  const placeBlock = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentBlock) return prev;

      const newGrid = prev.grid.map((row) => [...row]);
      const block = prev.currentBlock;

      newGrid[block.y][block.x] = { ...block, isNew: false };

      return { ...prev, grid: newGrid, currentBlock: null };
    });

    // Process merges after placing
    setTimeout(() => {
      processMergesAndGravity().then(() => {
        setTimeout(spawnBlock, 200);
      });
    }, 50);
  }, [processMergesAndGravity, spawnBlock]);

  // Move block down
  const moveDown = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentBlock || prev.gameOver || prev.isPaused) return prev;

      if (canMoveDown(prev.grid, prev.currentBlock)) {
        return {
          ...prev,
          currentBlock: {
            ...prev.currentBlock,
            y: prev.currentBlock.y + 1,
            isNew: false,
          },
        };
      }

      return prev;
    });
  }, []);

  // Check if block should be placed
  const checkAndPlace = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentBlock || prev.gameOver || prev.isPaused) return prev;

      if (!canMoveDown(prev.grid, prev.currentBlock)) {
        // Block can't move down, place it
        const newGrid = prev.grid.map((row) => [...row]);
        const block = prev.currentBlock;
        newGrid[block.y][block.x] = { ...block, isNew: false };

        setTimeout(() => {
          processMergesAndGravity().then(() => {
            setTimeout(spawnBlock, 200);
          });
        }, 50);

        return { ...prev, grid: newGrid, currentBlock: null };
      }

      return prev;
    });
  }, [processMergesAndGravity, spawnBlock]);

  // Move block left
  const moveLeft = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentBlock || prev.gameOver || prev.isPaused) return prev;

      if (canMoveLeft(prev.grid, prev.currentBlock)) {
        return {
          ...prev,
          currentBlock: { ...prev.currentBlock, x: prev.currentBlock.x - 1 },
        };
      }
      return prev;
    });
  }, []);

  // Move block right
  const moveRight = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentBlock || prev.gameOver || prev.isPaused) return prev;

      if (canMoveRight(prev.grid, prev.currentBlock)) {
        return {
          ...prev,
          currentBlock: { ...prev.currentBlock, x: prev.currentBlock.x + 1 },
        };
      }
      return prev;
    });
  }, []);

  // Hard drop
  const hardDrop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentBlock || prev.gameOver || prev.isPaused) return prev;

      let newY = prev.currentBlock.y;
      while (
        newY < GRID_HEIGHT - 1 &&
        prev.grid[newY + 1][prev.currentBlock.x] === null
      ) {
        newY++;
      }

      const newGrid = prev.grid.map((row) => [...row]);
      const block = { ...prev.currentBlock, y: newY, isNew: false };
      newGrid[newY][prev.currentBlock.x] = block;

      setTimeout(() => {
        processMergesAndGravity().then(() => {
          setTimeout(spawnBlock, 200);
        });
      }, 50);

      return { ...prev, grid: newGrid, currentBlock: null };
    });
  }, [processMergesAndGravity, spawnBlock]);

  // Start fast fall
  const startFastFall = useCallback(() => {
    setIsFastFalling(true);
  }, []);

  // Stop fast fall
  const stopFastFall = useCallback(() => {
    setIsFastFalling(false);
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    processingRef.current = false;
    setGameState((prev) => ({
      grid: createEmptyGrid(),
      currentBlock: null,
      nextValue: getRandomValue(),
      score: 0,
      highScore: prev.highScore,
      gameOver: false,
      isPaused: false,
    }));
    setTimeout(spawnBlock, 300);
  }, [spawnBlock]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Automatic falling
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused || !gameState.currentBlock) {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current);
        fallIntervalRef.current = null;
      }
      return;
    }

    const speed = isFastFalling ? FAST_FALL_SPEED : FALL_SPEED;

    fallIntervalRef.current = setInterval(() => {
      moveDown();
      checkAndPlace();
    }, speed);

    return () => {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current);
        fallIntervalRef.current = null;
      }
    };
  }, [
    gameState.gameOver,
    gameState.isPaused,
    gameState.currentBlock,
    isFastFalling,
    moveDown,
    checkAndPlace,
  ]);

  // Start game on mount
  useEffect(() => {
    const timer = setTimeout(spawnBlock, 500);
    return () => clearTimeout(timer);
  }, [spawnBlock]);

  return {
    gameState,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    startFastFall,
    stopFastFall,
    resetGame,
    togglePause,
  };
}
