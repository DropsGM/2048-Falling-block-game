"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { GameBoard } from "./game-board";
import { ScorePanel } from "./score-panel";
import { TouchControls } from "./touch-controls";
import { GameOverlay } from "./game-overlay";
import { HomeScreen, type Difficulty } from "./home-screen";
import { ThemeToggle } from "./theme-toggle";
import { getAllHighScores } from "@/lib/game-logic";
import { Home } from "lucide-react";

function GamePlay({ 
  difficulty, 
  onGoHome 
}: { 
  difficulty: Difficulty; 
  onGoHome: () => void;
}) {
  const {
    gameState,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    startFastFall,
    stopFastFall,
    resetGame,
    togglePause,
  } = useGame(difficulty);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          resetGame();
        }
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          moveRight();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          startFastFall();
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          break;
        case "p":
        case "P":
        case "Escape":
          e.preventDefault();
          togglePause();
          break;
        case "r":
        case "R":
          e.preventDefault();
          resetGame();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        stopFastFall();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    gameState.gameOver,
    moveLeft,
    moveRight,
    hardDrop,
    startFastFall,
    stopFastFall,
    togglePause,
    resetGame,
  ]);

  // Touch controls (swipe)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      const minSwipeDistance = 30;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            moveRight();
          } else {
            moveLeft();
          }
        }
      } else {
        // Vertical swipe
        if (deltaY > minSwipeDistance) {
          hardDrop();
        }
      }

      touchStartRef.current = null;
    },
    [moveLeft, moveRight, hardDrop]
  );

  const difficultyLabel = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  }[difficulty];

  const difficultyColor = {
    easy: "text-emerald-400",
    medium: "text-amber-400",
    hard: "text-rose-400",
  }[difficulty];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-4 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(100, 149, 237, 0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header with difficulty, theme toggle and home button */}
      <div className="relative z-10 w-full max-w-2xl flex items-center justify-between mb-3 px-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGoHome}
          className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          aria-label="Go to home"
        >
          <Home className="w-5 h-5 text-muted-foreground" />
        </motion.button>
        
        <h1 className="text-2xl font-bold text-primary tracking-wider">2048</h1>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${difficultyColor}`}>
            {difficultyLabel} Mode
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Main game layout - vertical stack */}
      <div className="flex flex-col items-center gap-4 relative z-10 w-full max-w-2xl px-2">
        {/* Score panel at top */}
        <div className="w-full">
          <ScorePanel
            score={gameState.score}
            highScore={gameState.highScore}
            nextValue={gameState.nextValue}
          />
        </div>

        {/* Game board */}
        <div className="relative">
          <GameBoard
            grid={gameState.grid}
            currentBlock={gameState.currentBlock}
            difficulty={difficulty}
          />

          <GameOverlay
            gameOver={gameState.gameOver}
            isPaused={gameState.isPaused}
            score={gameState.score}
            onRestart={resetGame}
            onTogglePause={togglePause}
            onGoHome={onGoHome}
          />
        </div>
      </div>

      {/* Touch controls for mobile */}
      <TouchControls
        onLeft={moveLeft}
        onRight={moveRight}
        onDown={moveDown}
        onDrop={hardDrop}
      />

      {/* Controls hint */}
      <p className="mt-4 text-xs text-muted-foreground text-center hidden md:block">
        Use arrow keys to move, Space to drop, P to pause
      </p>
    </motion.div>
  );
}

export function Falling2048Game() {
  const [screen, setScreen] = useState<"home" | "game">("home");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [highScores, setHighScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  // Load high scores
  useEffect(() => {
    setHighScores(getAllHighScores());
  }, [screen]);

  const handleSelectDifficulty = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setScreen("game");
  };

  const handleGoHome = () => {
    setScreen("home");
  };

  return (
    <AnimatePresence mode="wait">
      {screen === "home" ? (
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HomeScreen
            highScores={highScores}
            onSelectDifficulty={handleSelectDifficulty}
          />
        </motion.div>
      ) : (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GamePlay difficulty={difficulty} onGoHome={handleGoHome} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
