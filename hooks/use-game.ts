"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  type Block,
  type GameState,
  type Difficulty,
  DIFFICULTY_CONFIGS,
  createEmptyGrid,
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

export function useGame(difficulty: Difficulty) {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: createEmptyGrid(difficulty),
    currentBlock: null,
    nextValue: getRandomValue(difficulty),
    score: 0,
    highScore: 0,
    gameOver: false,
    isPaused: false,
    difficulty,
  }));

  const [isFastFalling, setIsFastFalling] = useState(false);
  const fallIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);
  const gameStartedRef = useRef(false);

  // Load high score on mount
  useEffect(() => {
    setGameState((prev) => ({ ...prev, highScore: getHighScore(difficulty) }));
  }, [difficulty]);

  // Spawn a new block
  const spawnBlock = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameOver || prev.isPaused) return prev;

      const spawnX = Math.floor(config.gridWidth / 2);

      // Check if spawn position is blocked
      if (prev.grid[0][spawnX] !== null) {
        const newHighScore = Math.max(prev.score, prev.highScore);
        setHighScore(newHighScore, difficulty);
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
        nextValue: getRandomValue(difficulty),
      };
    });
  }, [config.gridWidth, difficulty]);

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
            setHighScore(newHighScore, difficulty);
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
          setHighScore(newHighScore, difficulty);
          processingRef.current = false;
          return { ...prev, grid: mergeGrid, gameOver: true, highScore: newHighScore };
        }

        processingRef.current = false;
        return { ...prev, grid: mergeGrid };
      });
    };

    process();
  }, [difficulty]);

  // Move block down
  const moveDown = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentBlock || prev.gameOver || prev.isPaused) return prev;

      if (canMoveDown(prev.grid, prev.currentBlock, difficulty)) {
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
  }, [difficulty]);

  // Check if block should be placed
  const checkAndPlace = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentBlock || prev.gameOver || prev.isPaused) return prev;

      if (!canMoveDown(prev.grid, prev.currentBlock, difficulty)) {
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
  }, [processMergesAndGravity, spawnBlock, difficulty]);

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

      if (canMoveRight(prev.grid, prev.currentBlock, difficulty)) {
        return {
          ...prev,
          currentBlock: { ...prev.currentBlock, x: prev.currentBlock.x + 1 },
        };
      }
      return prev;
    });
  }, [difficulty]);

  // Hard drop
  const hardDrop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentBlock || prev.gameOver || prev.isPaused) return prev;

      let newY = prev.currentBlock.y;
      while (
        newY < config.gridHeight - 1 &&
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
  }, [processMergesAndGravity, spawnBlock, config.gridHeight]);

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
    gameStartedRef.current = false;
    setGameState((prev) => ({
      grid: createEmptyGrid(difficulty),
      currentBlock: null,
      nextValue: getRandomValue(difficulty),
      score: 0,
      highScore: prev.highScore,
      gameOver: false,
      isPaused: false,
      difficulty,
    }));
    setTimeout(() => {
      gameStartedRef.current = true;
      spawnBlock();
    }, 300);
  }, [spawnBlock, difficulty]);

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

    const speed = isFastFalling ? config.fastFallSpeed : config.fallSpeed;

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
    config.fallSpeed,
    config.fastFallSpeed,
  ]);

  // Start game on mount
  useEffect(() => {
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      const timer = setTimeout(spawnBlock, 500);
      return () => clearTimeout(timer);
    }
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
