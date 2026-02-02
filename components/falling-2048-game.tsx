"use client";

import React from "react"

import { useEffect, useRef, useCallback } from "react";
import { useGame } from "@/hooks/use-game";
import { GameBoard } from "./game-board";
import { ScorePanel } from "./score-panel";
import { TouchControls } from "./touch-controls";
import { GameOverlay } from "./game-overlay";

export function Falling2048Game() {
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
  } = useGame();

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

  return (
    <div
      ref={containerRef}
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

      {/* Main game layout */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        {/* Score panel (side on desktop, top on mobile) */}
        <div className="order-2 md:order-1 w-full md:w-32">
          <ScorePanel
            score={gameState.score}
            highScore={gameState.highScore}
            nextValue={gameState.nextValue}
          />
        </div>

        {/* Game board */}
        <div className="order-1 md:order-2 relative">
          <GameBoard
            grid={gameState.grid}
            currentBlock={gameState.currentBlock}
          />

          <GameOverlay
            gameOver={gameState.gameOver}
            isPaused={gameState.isPaused}
            score={gameState.score}
            onRestart={resetGame}
            onTogglePause={togglePause}
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

      {/* Install hint for PWA */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        Add to home screen for offline play
      </p>
    </div>
  );
}
